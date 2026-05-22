#!/usr/bin/env python3
"""
TruthWorldNews Distribution Engine
Auto-posts articles to social platforms via BrightBean Studio API.
Triggered after article status changes to 'published'.
"""

import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime, timezone

# -- CONFIG ------------------------------------------------------
BRIGHTBEAN_URL = os.getenv("BRIGHTBEAN_URL", "http://localhost:8000")
BRIGHTBEAN_API_KEY = os.getenv("BRIGHTBEAN_API_KEY")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

PLATFORM_TEMPLATES = {
    "twitter": {
        "max_length": 280,
        "template": "{hook}\n\n{hashtags}",
        "link_in_reply": True,
    },
    "linkedin": {
        "max_length": 3000,
        "template": "{contrarian_take}\n\n{link}",
        "style": "professional_contrarian",
    },
    "facebook": {
        "max_length": 5000,
        "template": "{headline}\n\n{summary}\n\n{link}",
    },
    "threads": {
        "max_length": 500,
        "template": "{short_rant}\n\n{link}",
    },
    "bluesky": {
        "max_length": 300,
        "template": "{hook}\n\n{link}",
    },
    "tiktok": {
        "max_length": 2200,
        "template": "Video caption: {headline}",
        "requires_video": True,
    },
    "youtube": {
        "max_length": 5000,
        "template": "{title}\n\n{description}\n\n{tags}",
        "requires_video": True,
    },
    "pinterest": {
        "max_length": 500,
        "template": "{headline}",
        "requires_image": True,
    },
}

AFFILIATE_LINKS = {
    "DeepSeek": "https://deepseek.com?ref=truthworldnews",
    "Claude": "https://claude.ai?ref=truthworldnews",
    "Groq": "https://groq.com?ref=truthworldnews",
    "Coinbase": "https://coinbase.com/join?ref=truthworldnews",
    "Ledger": "https://ledger.com?ref=truthworldnews",
}

def insert_affiliate_links(text: str, category: str) -> str:
    """Insert affiliate links into post text."""
    links = []
    if category == "AI":
        links = ["DeepSeek", "Claude", "Groq"]
    elif category == "Crypto":
        links = ["Coinbase", "Ledger"]

    for keyword in links:
        if keyword in text and keyword in AFFILIATE_LINKS:
            text = text.replace(
                keyword,
                f"{keyword} ({AFFILIATE_LINKS[keyword]})",
                1
            )

    return text

def get_recent_articles(limit: int = 5) -> List[Dict]:
    """Fetch recently published articles from Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []

    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/posts?select=*&status=eq.published&is_published=eq.true&order=created_at.desc&limit={limit}",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        },
        timeout=15
    )
    if res.status_code == 200:
        return res.json()
    return []

def generate_platform_content(article: Dict, platform: str) -> Optional[Dict]:
    """Generate platform-specific post content."""
    config = PLATFORM_TEMPLATES.get(platform)
    if not config:
        return None

    title = article.get("title", "")
    tldr = article.get("tldr_summary", "")
    content = article.get("content", "")[:200]
    category = article.get("category", "News")
    url = f"https://truthworldnews.com/article/{article.get('id')}/"

    hooks = {
        "AI": [
            f"Another AI company promising to change everything. I've heard this before. {title}",
            f"The AI hype machine is at it again. Here's what they're not telling you about {title}",
            f"15 years watching tech hype cycles. This one feels familiar. {title}",
        ],
        "Crypto": [
            f"Crypto bros are back with another 'revolution'. {title}",
            f"Remember when we were all going to be rich by now? {title}",
            f"The blockchain solves everything, except the things it doesn't. {title}",
        ],
        "Weird Tech": [
            f"This is either genius or completely unhinged. No in-between. {title}",
            f"Tech companies have run out of real problems to solve. {title}",
        ],
        "Leaks": [
            f"Leaked docs show what we already suspected. {title}",
            f"My source sent me this. Take it with a grain of salt. {title}",
        ],
        "default": [
            f"The mainstream media won't cover this angle. {title}",
            f"I've been watching this space for 15 years. Here's the real story. {title}",
            f"Press release vs reality: the gap is wider than you think. {title}",
        ],
    }

    hook_options = hooks.get(category, hooks["default"])
    hook = hook_options[hash(article.get("id")) % len(hook_options)]

    max_len = config["max_length"]
    hashtags = f"#{category.replace(' ', '')} #TechNews #TruthWorldNews"

    if platform == "twitter":
        text = f"{hook}\n\n{hashtags}"
        if len(text) > max_len:
            text = text[:max_len-3] + "..."
        text = insert_affiliate_links(text, category)
        return {
            "content": text,
            "link": url,
            "link_in_reply": True,
            "platform": platform,
        }
    elif platform == "linkedin":
        text = f"{hook}\n\nWhat the press release won't tell you: {tldr or content}\n\nRead the full analysis: {url}"
        if len(text) > max_len:
            text = text[:max_len-3] + "..."
        text = insert_affiliate_links(text, category)
        return {"content": text, "platform": platform}
    elif platform == "threads":
        text = f"{hook[:150]}\n\n{url}"
        text = insert_affiliate_links(text, category)
        return {"content": text, "platform": platform}
    else:
        text = f"{title}\n\n{tldr or content}\n\n{url}"
        if len(text) > max_len:
            text = text[:max_len-3] + "..."
        text = insert_affiliate_links(text, category)
        return {"content": text, "platform": platform}

def queue_to_brightbean(article: Dict, platforms: List[str]) -> bool:
    """Queue posts to BrightBean Studio."""
    if not BRIGHTBEAN_URL or not BRIGHTBEAN_API_KEY:
        print("BrightBean not configured")
        save_local_queue(article, platforms)
        return False

    posts = []
    for platform in platforms:
        content = generate_platform_content(article, platform)
        if content:
            posts.append({
                "content": content["content"],
                "platform": platform,
                "scheduled_at": None,
                "media_urls": [article.get("image_url")] if article.get("image_url") else [],
                "article_id": article.get("id"),
            })

    try:
        res = requests.post(
            f"{BRIGHTBEAN_URL}/api/v1/posts/bulk",
            headers={
                "Authorization": f"Bearer {BRIGHTBEAN_API_KEY}",
                "Content-Type": "application/json"
            },
            json={"posts": posts},
            timeout=30
        )

        if res.status_code in [200, 201]:
            print(f"Queued {len(posts)} posts to BrightBean")
            return True
        else:
            print(f"BrightBean error: {res.status_code} {res.text}")
            save_local_queue(article, platforms)
            return False
    except Exception as e:
        print(f"BrightBean connection failed: {e}")
        save_local_queue(article, platforms)
        return False

def save_local_queue(article: Dict, platforms: List[str]):
    """Save to local JSON queue as fallback."""
    queue_file = "social_queue.json"
    try:
        with open(queue_file, "r") as f:
            queue = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        queue = []

    for platform in platforms:
        content = generate_platform_content(article, platform)
        if content:
            queue.append({
                "article_id": article.get("id"),
                "title": article.get("title"),
                "platform": platform,
                "content": content["content"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "posted": False,
            })

    with open(queue_file, "w") as f:
        json.dump(queue, f, indent=2)

    print(f"Saved {len(platforms)} posts to local queue ({queue_file})")

def main():
    print("=" * 60)
    print("TRUTHWORLDNEWS DISTRIBUTION ENGINE")
    print("=" * 60)

    articles = get_recent_articles(limit=3)
    print(f"Found {len(articles)} recent articles")

    platforms = ["twitter", "linkedin", "threads", "bluesky", "facebook"]

    for article in articles:
        print(f"\nDistributing: {article['title'][:50]}...")
        queue_to_brightbean(article, platforms)

    print("\n" + "=" * 60)
    print("Distribution complete.")
    print("=" * 60)

if __name__ == "__main__":
    main()
