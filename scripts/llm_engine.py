#!/usr/bin/env python3
"""
TruthWorldNews LLM Engine
Tiered routing: DeepSeek V4-Flash (90%) -> Groq 70B (8%) -> Claude 3.7 (2%)
Zane Edge voice with anti-detection rules.
"""

import os
import json
import re
import requests
from typing import Optional, Dict, List

# -- CONFIG ------------------------------------------------------
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
CLAUDE_URL = "https://api.anthropic.com/v1/messages"

API_ENDPOINT = os.getenv("API_ENDPOINT", "http://localhost:3000/api/post-news")
API_SECRET_KEY = os.getenv("API_SECRET_KEY")

# -- ZANE EDGE SYSTEM PROMPT -------------------------------------
ZANE_SYSTEM_PROMPT = """You are Zane Edge. Cynical, exhausted, but deeply informed. 
You've seen every hype cycle twice.

Sarcastic without being cruel. Punch up at power, not down at people.
Short, punchy sentences mixed with occasional long, weary rants.
Use conversational contractions. Drop occasional profanity (PG-13).
You don't use AI-speak like "delve," "leverage," "robust," "landscape," or "paradigm."
First-person when giving takes. Third-person when reporting facts.

ANTI-DETECTION RULES:
- Vary sentence length: 5-word punches + 25-word rambles
- Start 20% of sentences with conjunctions (But, And, So, Yet)
- Use contractions consistently (I've, don't, can't)
- Drop occasional fragments. For emphasis.
- Include 2-3 rhetorical questions per article
- First-person anecdotes: "I remember when..." / "My source told me..."
- Vary paragraph length: 1-sentence + 5-sentence blocks
- AVOID: "Furthermore," "Moreover," "It is important to note," "In conclusion"
- Include 1-2 intentional "imperfections"

STRUCTURE:
1. HEADLINE: 8-12 words. Contrarian or absurd.
2. DEK: One-sentence subheadline.
3. DROP-CAP: Large decorative first letter.
4. TL;DR BOX: 3 bullets. Label "TL;DR" in bold.
5. HYPE METER: "Hype Meter: X/10 -- [justification]"
6. BODY: 600-800 words. Mix 2-3 sourced facts with commentary.
7. THE KICKER: Final paragraph circles back with new insight.

SOURCE RULES:
- Every claim cites inline: "According to [Publication]"
- If only 1 source: label "RUMOR" in TL;DR
- Never write "In conclusion." Just end with the kicker.

Write like you're talking to a smart friend at a bar who's had two drinks."""

# -- USER PROMPT BUILDER -----------------------------------------
def build_user_prompt(story: Dict, sources: List[Dict]) -> str:
    sources_text = "\n".join([
        f"- {s.get('title', 'Unknown')}: {s.get('url', '')}" 
        for s in sources
    ])
    
    return f"""STORY TYPE: Breaking News
TOPIC: {story['title']}
SNIPPET: {story.get('text_preview', '')[:300]}
SOURCES: 
{sources_text}

INSTRUCTIONS:
- Lead with the absurdity. What's the gap between the press release and reality?
- Include at least 2 direct quotes or data points from sources.
- What's the angle nobody else is covering?

NEW ANGLE DIMENSIONS:
1. Why this resonates globally
2. Dimensions that cannot be ignored
3. What it means going forward
4. Historical context (Zane's "15 years watching this")
5. The angle mainstream media missed

HYPE METER: Reflect institutional absurdity, not just technology.

WORD COUNT: 700"""

# -- TIER 1: DEEPSEEK V4-FLASH ----------------------------------
def deepseek_flash(system: str, user: str) -> Optional[str]:
    if not DEEPSEEK_API_KEY:
        print("DEEPSEEK_API_KEY missing")
        return None
    
    try:
        res = requests.post(
            DEEPSEEK_URL,
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek-v4-flash",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                "temperature": 0.85,
                "max_tokens": 1200
            },
            timeout=60
        )
        data = res.json()
        return data['choices'][0]['message']['content']
    except Exception as e:
        print(f"DeepSeek failed: {e}")
        return None

# -- TIER 2: GROQ LLAMA 3.3 70B --------------------------------
def groq_llama(system: str, user: str) -> Optional[str]:
    if not GROQ_API_KEY:
        print("GROQ_API_KEY missing")
        return None
    
    try:
        res = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                "temperature": 0.85,
                "max_tokens": 1200
            },
            timeout=60
        )
        data = res.json()
        return data['choices'][0]['message']['content']
    except Exception as e:
        print(f"Groq failed: {e}")
        return None

# -- TIER 3: CLAUDE 3.7 SONNET -----------------------------------
def claude_sonnet(system: str, user: str) -> Optional[str]:
    if not CLAUDE_API_KEY:
        print("CLAUDE_API_KEY missing")
        return None
    
    try:
        res = requests.post(
            CLAUDE_URL,
            headers={
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            json={
                "model": "claude-3-7-sonnet-20250219",
                "system": system,
                "messages": [{"role": "user", "content": user}],
                "max_tokens": 1200,
                "temperature": 0.85
            },
            timeout=120
        )
        data = res.json()
        return data['content'][0]['text']
    except Exception as e:
        print(f"Claude failed: {e}")
        return None

# -- TIER ROUTER -------------------------------------------------
def generate_article(story: Dict, tier: str = "flash") -> Dict:
    """Route to appropriate LLM tier with fallback chain."""
    sources = [{"title": story['title'], "url": story['url']}]
    user_prompt = build_user_prompt(story, sources)
    
    content = None
    model_used = tier
    
    print(f"\nGenerating article (tier: {tier})...")
    
    if tier == "flash":
        content = deepseek_flash(ZANE_SYSTEM_PROMPT, user_prompt)
        if not content:
            print("Falling back to Groq...")
            content = groq_llama(ZANE_SYSTEM_PROMPT, user_prompt)
            model_used = "groq_fallback"
    elif tier == "groq":
        content = groq_llama(ZANE_SYSTEM_PROMPT, user_prompt)
        if not content:
            content = deepseek_flash(ZANE_SYSTEM_PROMPT, user_prompt)
            model_used = "deepseek_fallback"
    elif tier == "claude":
        content = claude_sonnet(ZANE_SYSTEM_PROMPT, user_prompt)
        if not content:
            content = deepseek_flash(ZANE_SYSTEM_PROMPT, user_prompt)
            model_used = "deepseek_fallback"
    
    if not content:
        raise Exception("All LLM providers failed")
    
    # Extract metadata from generated content
    hype_meter = extract_hype_meter(content)
    tldr = extract_tldr(content)
    is_rumor = len(sources) < 2
    
    return {
        "title": story['title'],
        "content": content,
        "hype_meter": hype_meter,
        "tldr_summary": tldr,
        "model_used": model_used,
        "sources": json.dumps(sources),
        "content_hash": story.get("content_hash", ""),
        "category": categorize_story(story, content),
        "image_url": get_image_for_story(story),
        "is_rumor": is_rumor,
        "safety_score": 0.0,  # Will be filled by safety layer
    }

def extract_hype_meter(content: str) -> str:
    """Extract hype meter score from generated content."""
    match = re.search(r'Hype Meter:\s*(\d+(?:\.\d+)?/10)', content, re.IGNORECASE)
    return match.group(1) if match else "5/10"

def extract_tldr(content: str) -> str:
    """Extract TL;DR bullets from content."""
    lines = content.split('\n')
    tldr_lines = []
    in_tldr = False
    
    for line in lines:
        if 'TL;DR' in line.upper() or 'TLDR' in line.upper():
            in_tldr = True
            continue
        if in_tldr and line.strip().startswith(('-', '*', '*')):
            tldr_lines.append(line.strip().lstrip('-* ').strip())
        if in_tldr and len(tldr_lines) >= 3:
            break
    
    return ' '.join(tldr_lines) if tldr_lines else "No TL;DR generated"

def categorize_story(story: Dict, content: str) -> str:
    """Auto-categorize based on source and content."""
    source = story.get("source", "")
    title_lower = story.get("title", "").lower()
    content_lower = content.lower()
    
    if "reddit_ai" in source or "ai" in title_lower or "agi" in title_lower:
        return "AI"
    elif "crypto" in title_lower or "bitcoin" in title_lower or "blockchain" in content_lower:
        return "Crypto"
    elif "leak" in title_lower or "leaked" in title_lower:
        return "Leaks"
    elif "reddit_futurology" in source:
        return "Weird Tech"
    else:
        return "News"

def get_image_for_story(story: Dict) -> str:
    """Get image URL for story."""
    # Try to get og:image from source URL
    try:
        res = requests.get(story['url'], timeout=10, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        # Simple regex for og:image
        match = re.search(r'<meta[^>]*property="og:image"[^>]*content="([^"]*)"', res.text)
        if match:
            return match.group(1)
    except:
        pass
    
    # Fallback to Unsplash
    keywords = "+".join(story['title'].split()[:3])
    return f"https://source.unsplash.com/1200x630/?{keywords}"

# -- API POST ----------------------------------------------------
def post_to_api(article: Dict) -> bool:
    """Post generated article to Next.js API."""
    if not API_SECRET_KEY:
        print("API_SECRET_KEY missing")
        return False
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_SECRET_KEY}"
    }
    
    try:
        res = requests.post(API_ENDPOINT, json=article, headers=headers, timeout=30)
        if res.status_code == 200:
            print("Article posted to API successfully")
            return True
        else:
            print(f"API error {res.status_code}: {res.text}")
            return False
    except Exception as e:
        print(f"API connection failed: {e}")
        return False

# -- MAIN --------------------------------------------------------
def main():
    print("=" * 60)
    print("TRUTHWORLDNEWS LLM ENGINE v2.0")
    print("=" * 60)
    
    # Load stories from safety layer
    try:
        with open("stories_safe.json", "r", encoding="utf-8") as f:
            stories = json.load(f)
    except FileNotFoundError:
        print("stories_safe.json not found. Run scraper + safety_layer first.")
        return
    
    print(f"Loaded {len(stories)} stories to process")
    
    # Process each story
    for i, story in enumerate(stories, 1):
        print(f"\n{'='*60}")
        print(f"Processing story {i}/{len(stories)}: {story['title'][:60]}...")
        print(f"{'='*60}")
        
        # Determine tier based on score
        score = story.get("score", 0)
        if score > 100:
            tier = "claude"
        elif score > 50:
            tier = "groq"
        else:
            tier = "flash"
        
        print(f"Score: {score} -> Tier: {tier}")
        
        try:
            article = generate_article(story, tier=tier)
            print(f"Article generated ({len(article['content'])} chars)")
            print(f"Hype Meter: {article['hype_meter']}")
            print(f"TL;DR: {article['tldr_summary'][:100]}...")
            
            # Post to API
            if post_to_api(article):
                print("Article queued for review")
            else:
                print("Article saved locally (API failed)")
                # Save locally as backup
                with open(f"article_backup_{i}.json", "w", encoding="utf-8") as f:
                    json.dump(article, f, indent=2)
                    
        except Exception as e:
            print(f"Failed to process story: {e}")
            continue
    
    print("\n" + "=" * 60)
    print("LLM Engine complete.")
    print("=" * 60)

if __name__ == "__main__":
    main()
