#!/usr/bin/env python3
"""
TruthWorldNews Content Safety Layer
Runs between scraper and LLM engine.
Filters: toxicity, source credibility, freshness, clickbait detection.
"""

import os
import json
import re
import requests
from typing import Dict, List, Tuple
from datetime import datetime, timezone

# -- CONFIG ------------------------------------------------------
PERSPECTIVE_API_KEY = os.getenv("PERSPECTIVE_API_KEY")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")

PERSPECTIVE_URL = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze"
NEWSAPI_URL = "https://newsapi.org/v2/everything"

# Safety thresholds
TOXICITY_THRESHOLD = 0.8
SEVERE_TOXICITY_THRESHOLD = 0.6
IDENTITY_ATTACK_THRESHOLD = 0.7
THREAT_THRESHOLD = 0.6

# -- PERSPECTIVE API ---------------------------------------------
def check_toxicity(text: str) -> Dict:
    """Check content toxicity using Google's Perspective API."""
    if not PERSPECTIVE_API_KEY:
        print("PERSPECTIVE_API_KEY missing -- skipping toxicity check")
        return {"passed": True, "scores": {}}
    
    try:
        res = requests.post(
            PERSPECTIVE_URL,
            params={"key": PERSPECTIVE_API_KEY},
            json={
                "comment": {"text": text[:20000]},  # API limit
                "languages": ["en"],
                "requestedAttributes": {
                    "TOXICITY": {},
                    "SEVERE_TOXICITY": {},
                    "IDENTITY_ATTACK": {},
                    "THREAT": {},
                    "INSULT": {},
                    "PROFANITY": {}
                }
            },
            timeout=30
        )
        data = res.json()
        
        scores = {}
        for attr, result in data.get("attributeScores", {}).items():
            scores[attr] = result.get("summaryScore", {}).get("value", 0)
        
        # Check thresholds
        passed = (
            scores.get("TOXICITY", 0) < TOXICITY_THRESHOLD and
            scores.get("SEVERE_TOXICITY", 0) < SEVERE_TOXICITY_THRESHOLD and
            scores.get("IDENTITY_ATTACK", 0) < IDENTITY_ATTACK_THRESHOLD and
            scores.get("THREAT", 0) < THREAT_THRESHOLD
        )
        
        return {"passed": passed, "scores": scores}
        
    except Exception as e:
        print(f"Perspective API failed: {e}")
        return {"passed": True, "scores": {}}

# -- SOURCE VERIFICATION ----------------------------------------
def verify_sources(story: Dict) -> Tuple[bool, List[Dict]]:
    """
    Verify story has credible sources.
    Returns: (is_verified, list_of_sources)
    """
    sources = []
    primary_url = story.get("url", "")
    primary_title = story.get("title", "")
    
    # Primary source is always included
    sources.append({
        "title": primary_title,
        "url": primary_url,
        "source_name": story.get("source", "unknown"),
        "credibility": get_source_credibility(story.get("source", ""))
    })
    
    # Try to find corroborating sources via NewsAPI
    if NEWSAPI_KEY:
        try:
            res = requests.get(
                NEWSAPI_URL,
                params={
                    "q": primary_title[:100],
                    "language": "en",
                    "sortBy": "relevancy",
                    "pageSize": 3,
                    "apiKey": NEWSAPI_KEY
                },
                timeout=15
            )
            data = res.json()
            
            for article in data.get("articles", [])[:2]:
                # Skip if same URL
                if article.get("url") == primary_url:
                    continue
                
                sources.append({
                    "title": article.get("title", ""),
                    "url": article.get("url", ""),
                    "source_name": article.get("source", {}).get("name", "NewsAPI"),
                    "credibility": get_source_credibility(article.get("source", {}).get("name", ""))
                })
                
        except Exception as e:
            print(f"NewsAPI verification failed: {e}")
    
    # Determine if verified (2+ sources or high-credibility single source)
    is_verified = len(sources) >= 2 or any(s["credibility"] >= 8 for s in sources)
    
    return is_verified, sources

def get_source_credibility(source_name: str) -> int:
    """Rate source credibility 1-10."""
    high_cred = ["bbc", "reuters", "ap", "associated press", "nyt", "new york times", 
                 "wsj", "wall street journal", "the guardian", "nature", "science",
                 "hackernews", "reddit"]
    medium_cred = ["techcrunch", "the verge", "wired", "ars technica", "engadget",
                   "bloomberg", "forbes", "cnn", "washington post"]
    low_cred = ["twitter", "x.com", "facebook", "blog", "medium", "substack"]
    
    source_lower = source_name.lower()
    
    for s in high_cred:
        if s in source_lower:
            return 9
    for s in medium_cred:
        if s in source_lower:
            return 6
    for s in low_cred:
        if s in source_lower:
            return 3
    
    return 5  # Default

# -- CLICKBAIT DETECTION ------------------------------------------
def detect_clickbait(title: str) -> Tuple[bool, float]:
    """Detect clickbait patterns. Returns (is_clickbait, score)."""
    clickbait_patterns = [
        r'\b(shocking|mind-blowing|you won\'t believe|doctors hate|secret|trick)',
        r'\b(exposed|revealed|conspiracy|they don\'t want you to know)',
        r'!\s*$',  # Ends with exclamation
        r'[A-Z\s]{10,}',  # ALL CAPS words
        r'\b(click here|read this|must see|urgent|breaking)',
        r'\d+ (things|ways|reasons|facts) you',
    ]
    
    score = 0
    for pattern in clickbait_patterns:
        if re.search(pattern, title, re.IGNORECASE):
            score += 0.25
    
    # Cap at 1.0
    score = min(score, 1.0)
    
    # Zane Edge style is intentionally absurd but not deceptive
    # Allow high absurdity if it has substance indicators
    substance_indicators = len(title.split()) >= 8 and any(
        word in title.lower() for word in ["ai", "crypto", "tech", "data", "research", "study"]
    )
    
    if substance_indicators and score < 0.6:
        is_clickbait = False
    else:
        is_clickbait = score > 0.5
    
    return is_clickbait, score

# -- FRESHNESS CHECK ---------------------------------------------
def check_freshness(story: Dict) -> Tuple[bool, float]:
    """Check if story is fresh enough (<48h preferred, <7d acceptable)."""
    age_hours = story.get("age_hours", 0)
    
    if age_hours < 24:
        return True, 1.0
    elif age_hours < 48:
        return True, 0.8
    elif age_hours < 168:  # 7 days
        return True, 0.5
    else:
        return False, 0.2

# -- MAIN SAFETY CHECK -------------------------------------------
def process_story(story: Dict) -> Dict:
    """Run full safety check on a story."""
    print(f"\n{'='*60}")
    print(f"SAFETY CHECK: {story['title'][:60]}...")
    print(f"{'='*60}")
    
    result = {
        "story": story,
        "passed": True,
        "flags": [],
        "safety_score": 0.0,
        "sources": [],
        "is_verified": False,
        "is_rumor": False,
    }
    
    # 1. Toxicity check
    print("Checking toxicity...")
    toxicity = check_toxicity(story.get("text_preview", story.get("title", "")))
    if not toxicity["passed"]:
        result["passed"] = False
        result["flags"].append(f"TOXICITY: {toxicity['scores']}")
        print(f"FAILED toxicity check: {toxicity['scores']}")
    else:
        print("Toxicity check passed")
    
    # 2. Source verification
    print("Verifying sources...")
    is_verified, sources = verify_sources(story)
    result["is_verified"] = is_verified
    result["sources"] = sources
    
    if not is_verified:
        result["is_rumor"] = True
        result["flags"].append("RUMOR: Only 1 source found")
        print("Single source -- flagged as RUMOR")
    else:
        print(f"Verified with {len(sources)} sources")
    
    # 3. Clickbait detection
    print("Checking clickbait...")
    is_clickbait, cb_score = detect_clickbait(story.get("title", ""))
    if is_clickbait:
        result["flags"].append(f"CLICKBAIT: score {cb_score}")
        print(f"Clickbait detected: {cb_score}")
    else:
        print(f"Not clickbait: {cb_score}")
    
    # 4. Freshness
    print("Checking freshness...")
    is_fresh, freshness_score = check_freshness(story)
    if not is_fresh:
        result["flags"].append(f"STALE: {story.get('age_hours', 0)}h old")
        print("Story is stale")
    else:
        print(f"Fresh: {freshness_score}")
    
    # Calculate overall safety score (0-100)
    safety_score = 100
    if toxicity["scores"].get("TOXICITY", 0) > 0.5:
        safety_score -= 30
    if result["is_rumor"]:
        safety_score -= 20
    if is_clickbait:
        safety_score -= 15
    if not is_fresh:
        safety_score -= 10
    
    result["safety_score"] = max(0, safety_score)
    
    # Auto-reject if safety score < 50
    if result["safety_score"] < 50:
        result["passed"] = False
        result["flags"].append(f"LOW_SAFETY_SCORE: {result['safety_score']}")
        print(f"AUTO-REJECTED: Safety score {result['safety_score']}")
    else:
        print(f"Safety score: {result['safety_score']}/100")
    
    print(f"{'='*60}")
    return result

def main():
    print("=" * 60)
    print("TRUTHWORLDNEWS SAFETY LAYER")
    print("=" * 60)
    
    # Load stories from scraper
    try:
        with open("stories_to_process.json", "r", encoding="utf-8") as f:
            stories = json.load(f)
    except FileNotFoundError:
        print("stories_to_process.json not found. Run scraper first.")
        return
    
    print(f"Loaded {len(stories)} stories")
    
    safe_stories = []
    rejected_stories = []
    
    for story in stories:
        result = process_story(story)
        
        if result["passed"]:
            # Enrich story with safety data
            story["safety_score"] = result["safety_score"]
            story["is_rumor"] = result["is_rumor"]
            story["verified_sources"] = result["sources"]
            story["flags"] = result["flags"]
            safe_stories.append(story)
            print(f"APPROVED: {story['title'][:50]}...")
        else:
            rejected_stories.append({
                "title": story["title"],
                "reason": result["flags"],
                "safety_score": result["safety_score"]
            })
            print(f"REJECTED: {story['title'][:50]}... -- {result['flags']}")
    
    # Save safe stories for LLM processing
    with open("stories_safe.json", "w", encoding="utf-8") as f:
        json.dump(safe_stories, f, indent=2, ensure_ascii=False)
    
    # Save rejected stories for audit
    with open("stories_rejected.json", "w", encoding="utf-8") as f:
        json.dump(rejected_stories, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"RESULTS: {len(safe_stories)} safe, {len(rejected_stories)} rejected")
    print(f"Safe stories saved to stories_safe.json")
    print(f"Rejected stories saved to stories_rejected.json")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
