#!/usr/bin/env python3
"""
TruthWorldNews Production Scraper
Multi-source, concurrent, deduplicated, scored.
"""

import os
import json
import hashlib
import requests
import feedparser
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional

# -- CONFIG ------------------------------------------------------
SOURCES = {
    "reddit_technology": "https://www.reddit.com/r/technology/",
    "reddit_futurology": "https://www.reddit.com/r/Futurology/",
    "reddit_ai": "https://www.reddit.com/r/ArtificialIntelligence/",
}

HACKERNEWS_TOP = "https://hacker-news.firebaseio.com/v0/topstories.json"
HACKERNEWS_ITEM = "https://hacker-news.firebaseio.com/v0/item/{}.json"
BBC_RSS = "http://feeds.bbci.co.uk/news/world/rss.xml"

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service role key

# -- DEDUPLICATION -----------------------------------------------
def get_content_hash(title: str, url: str) -> str:
    """Generate 16-char hash for deduplication."""
    return hashlib.sha256(f"{title.lower().strip()}|{url}".encode()).hexdigest()[:16]

def is_duplicate(title: str, url: str) -> bool:
    """Check if story exists in database (last 30 days)."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return False
    
    content_hash = get_content_hash(title, url)
    try:
        res = requests.get(
            f"{SUPABASE_URL}/rest/v1/posts?select=id&content_hash=eq.{content_hash}&limit=1",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            },
            timeout=10
        )
        return len(res.json()) > 0
    except Exception as e:
        print(f"Dedup check failed: {e}")
        return False

# -- REDDIT SCRAPER (using requests + BeautifulSoup fallback) -----
def scrape_reddit(subreddit: str) -> List[Dict]:
    """Scrape Reddit subreddit for top posts."""
    url = f"https://www.reddit.com/r/{subreddit}/.json"
    headers = {
        "User-Agent": "TruthWorldNews/1.0 (Scraper Bot)"
    }
    
    try:
        res = requests.get(url, headers=headers, timeout=15)
        data = res.json()
        
        posts = []
        for child in data.get("data", {}).get("children", [])[:10]:
            post = child.get("data", {})
            
            # Skip stickied/promoted posts
            if post.get("stickied") or post.get("promoted"):
                continue
            
            posts.append({
                "source": f"reddit_{subreddit}",
                "title": post.get("title", ""),
                "url": f"https://reddit.com{post.get('permalink', '')}",
                "upvotes": post.get("ups", 0),
                "comment_count": post.get("num_comments", 0),
                "author": post.get("author", "unknown"),
                "text_preview": post.get("selftext", "")[:500],
                "flair": post.get("link_flair_text", ""),
                "created_utc": post.get("created_utc", 0),
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            })
        
        print(f"Reddit r/{subreddit}: {len(posts)} posts")
        return posts
        
    except Exception as e:
        print(f"Reddit r/{subreddit} failed: {e}")
        return []

# -- HACKER NEWS SCRAPER -----------------------------------------
def scrape_hackernews() -> List[Dict]:
    """Scrape top stories from Hacker News API."""
    try:
        # Get top story IDs
        res = requests.get(HACKERNEWS_TOP, timeout=10)
        top_ids = res.json()[:15]
        
        stories = []
        for story_id in top_ids:
            story_res = requests.get(
                HACKERNEWS_ITEM.format(story_id),
                timeout=10
            )
            story = story_res.json()
            
            if not story or story.get("deleted") or story.get("dead"):
                continue
            
            # Calculate age in hours
            age_hours = (datetime.now(timezone.utc).timestamp() - story.get("time", 0)) / 3600
            
            stories.append({
                "source": "hackernews",
                "title": story.get("title", ""),
                "url": story.get("url", f"https://news.ycombinator.com/item?id={story_id}"),
                "upvotes": story.get("score", 0),
                "comment_count": story.get("descendants", 0),
                "author": story.get("by", "unknown"),
                "text_preview": story.get("text", "")[:500],
                "age_hours": round(age_hours, 1),
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            })
        
        print(f"Hacker News: {len(stories)} stories")
        return stories
        
    except Exception as e:
        print(f"Hacker News failed: {e}")
        return []

# -- BBC RSS SCRAPER (Legacy fallback) ---------------------------
def scrape_bbc() -> List[Dict]:
    """Scrape BBC World RSS feed."""
    try:
        feed = feedparser.parse(BBC_RSS)
        stories = []
        
        for entry in feed.entries[:10]:
            # Parse published date
            published = entry.get("published_parsed")
            age_hours = 48  # Default if can't parse
            
            if published:
                pub_dt = datetime(*published[:6])
                age_hours = (datetime.now(timezone.utc) - pub_dt).total_seconds() / 3600
            
            stories.append({
                "source": "bbc_world",
                "title": entry.title,
                "url": entry.link,
                "upvotes": 0,
                "comment_count": 0,
                "author": "BBC",
                "text_preview": entry.get("summary", "")[:500],
                "age_hours": round(age_hours, 1),
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            })
        
        print(f"BBC World: {len(stories)} stories")
        return stories
        
    except Exception as e:
        print(f"BBC World failed: {e}")
        return []

# -- SCORING & FILTERING -----------------------------------------
def score_story(story: Dict) -> float:
    """Score based on engagement, freshness, and source weight."""
    engagement = story.get("upvotes", 0) + story.get("comment_count", 0) * 2
    
    # Source weights (Reddit > HN > BBC)
    weights = {
        "reddit_technology": 1.5,
        "reddit_futurology": 1.4,
        "reddit_ai": 1.3,
        "hackernews": 1.2,
        "bbc_world": 1.0,
    }
    weight = weights.get(story["source"], 1.0)
    
    # Freshness penalty (>48h = heavy penalty)
    age_hours = story.get("age_hours", 0)
    freshness_multiplier = max(0.1, 1.0 - (age_hours / 48))
    
    return engagement * weight * freshness_multiplier

def filter_stories(stories: List[Dict], min_score: float = 10.0) -> List[Dict]:
    """Remove duplicates, low-engagement, and stale stories."""
    filtered = []
    seen_hashes = set()
    
    for story in stories:
        # Skip if missing title or url
        if not story.get("title") or not story.get("url"):
            continue
        
        # Deduplicate by hash
        content_hash = get_content_hash(story["title"], story["url"])
        if content_hash in seen_hashes:
            continue
        seen_hashes.add(content_hash)
        
        # Check database for duplicates
        if is_duplicate(story["title"], story["url"]):
            print(f"Duplicate skipped: {story['title'][:50]}...")
            continue
        
        # Score and filter
        story["content_hash"] = content_hash
        story["score"] = round(score_story(story), 2)
        
        if story["score"] >= min_score:
            filtered.append(story)
        else:
            print(f"Low score ({story['score']}): {story['title'][:50]}...")
    
    return sorted(filtered, key=lambda x: x["score"], reverse=True)

# -- MAIN --------------------------------------------------------
def main():
    print("=" * 60)
    print("TRUTHWORLDNEWS SCRAPER v2.0")
    print(f"Started: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)
    
    all_stories = []
    
    # Scrape all sources
    print("\nSCRAPING SOURCES...")
    all_stories.extend(scrape_reddit("technology"))
    all_stories.extend(scrape_reddit("futurology"))
    all_stories.extend(scrape_reddit("artificialintelligence"))
    all_stories.extend(scrape_hackernews())
    all_stories.extend(scrape_bbc())
    
    print(f"\nTotal stories scraped: {len(all_stories)}")
    
    # Filter and score
    print("\nFILTERING & SCORING...")
    top_stories = filter_stories(all_stories, min_score=5.0)
    print(f"Top stories after filtering: {len(top_stories)}")
    
    # Save to file for LLM processing
    output_file = "stories_to_process.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(top_stories[:5], f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved top 5 stories to {output_file}")
    
    # Print summary
    print("\nTOP STORIES:")
    for i, story in enumerate(top_stories[:5], 1):
        print(f"  {i}. [{story['source']}] Score: {story['score']}")
        print(f"     {story['title'][:70]}...")
        print(f"     {story['upvotes']} upvotes | {story['comment_count']} comments | {story.get('age_hours', 'N/A')}h")
        print()
    
    print("=" * 60)
    print("Scraper complete.")
    print("=" * 60)

if __name__ == "__main__":
    main()
