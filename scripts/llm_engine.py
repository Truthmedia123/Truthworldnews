#!/usr/bin/env python3
"""
TruthWorldNews LLM Engine — NVIDIA OFFICIAL API EDITION
Tiered routing: kimi-k2.6 (Tier 1) → nemotron-3-super (Tier 2) → deepseek-v4-flash (Tier 3)
Uses exact code patterns from NVIDIA documentation.
"""

import os
import json
import re
import requests
from typing import Optional, Dict, List

# Try to import OpenAI client, fallback to requests
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️ OpenAI client not installed. Using requests fallback.")

# ── CONFIG ───────────────────────────────────────────────────────
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

if not NVIDIA_API_KEY:
    raise ValueError("NVIDIA_API_KEY environment variable required")

# Initialize OpenAI client (for nemotron and deepseek)
if OPENAI_AVAILABLE:
    client = OpenAI(base_url=NVIDIA_BASE_URL, api_key=NVIDIA_API_KEY)

# ── ZANE EDGE SYSTEM PROMPT ──────────────────────────────────────
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
5. HYPE METER: "Hype Meter: X/10 — [justification]"
6. BODY: 600-800 words. Mix 2-3 sourced facts with commentary.
7. THE KICKER: Final paragraph circles back with new insight.

SOURCE RULES:
- Every claim cites inline: "According to [Publication]"
- If only 1 source: label "RUMOR" in TL;DR
- Never write "In conclusion." Just end with the kicker.

Write like you're talking to a smart friend at a bar who's had two drinks."""

# ── USER PROMPT BUILDER ──────────────────────────────────────────
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

# ── TIER 1: KIMI K2.6 (Official NVIDIA requests pattern) ──────────
def kimi_k26(system: str, user: str) -> Optional[str]:
    """Uses NVIDIA's official requests pattern. Model: moonshotai/kimi-k2.6"""
    try:
        headers = {
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "moonshotai/kimi-k2.6",
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "max_tokens": 1200,
            "temperature": 0.85,
            "top_p": 0.9,
            "stream": False,
        }

        response = requests.post(
            f"{NVIDIA_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=120
        )

        data = response.json()
        return data['choices'][0]['message']['content']

    except Exception as e:
        print(f"❌ kimi-k2.6 failed: {e}")
        return None

# ── TIER 2: NEMOTRON 3 SUPER 120B (Official OpenAI client pattern) ─
def nemotron_super(system: str, user: str) -> Optional[str]:
    """Uses NVIDIA's official OpenAI client pattern. Model: nvidia/nemotron-3-super-120b-a12b"""
    if not OPENAI_AVAILABLE:
        print("⚠️ OpenAI client not available, skipping nemotron")
        return None

    try:
        completion = client.chat.completions.create(
            model="nvidia/nemotron-3-super-120b-a12b",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            temperature=0.85,
            top_p=0.9,
            max_tokens=1200,
            extra_body={
                "chat_template_kwargs": {
                    "enable_thinking": True
                },
                "reasoning_budget": 1200
            },
            stream=False
        )

        return completion.choices[0].message.content

    except Exception as e:
        print(f"❌ nemotron-3-super failed: {e}")
        return None

# ── TIER 3: DEEPSEEK V4-FLASH (Official OpenAI client pattern) ────
def deepseek_flash(system: str, user: str) -> Optional[str]:
    """Uses NVIDIA's official OpenAI client pattern. Model: deepseek-ai/deepseek-v4-flash"""
    if not OPENAI_AVAILABLE:
        print("⚠️ OpenAI client not available, skipping deepseek")
        return None

    try:
        completion = client.chat.completions.create(
            model="deepseek-ai/deepseek-v4-flash",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            temperature=0.85,
            top_p=0.9,
            max_tokens=1200,
            extra_body={
                "chat_template_kwargs": {
                    "thinking": True,
                    "reasoning_effort": "high"
                }
            },
            stream=False
        )

        return completion.choices[0].message.content

    except Exception as e:
        print(f"❌ deepseek-v4-flash failed: {e}")
        return None

# ── FALLBACK: Raw requests for DeepSeek (if OpenAI fails) ────────
def deepseek_flash_requests(system: str, user: str) -> Optional[str]:
    """Fallback using raw requests if OpenAI client fails."""
    try:
        headers = {
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek-ai/deepseek-v4-flash",
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "temperature": 0.85,
            "top_p": 0.9,
            "max_tokens": 1200,
            "stream": False
        }

        response = requests.post(
            f"{NVIDIA_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=120
        )

        data = response.json()
        return data['choices'][0]['message']['content']

    except Exception as e:
        print(f"❌ deepseek requests fallback failed: {e}")
        return None

# ── TIER ROUTER ──────────────────────────────────────────────────
def generate_article(story: Dict, tier: str = "flash") -> Dict:
    """Route to appropriate LLM tier with fallback chain."""
    sources = [{"title": story['title'], "url": story['url']}]
    user_prompt = build_user_prompt(story, sources)

    content = None
    model_used = tier

    print(f"\n🤖 Generating article (tier: {tier})...")

    if tier == "flash":
        # Tier 1: kimi-k2.6 (requests pattern)
        content = kimi_k26(ZANE_SYSTEM_PROMPT, user_prompt)
        model_used = "nvidia-kimi-k2.6"

        if not content:
            # Tier 2 fallback: nemotron-3-super (OpenAI pattern)
            print("🔄 kimi failed, trying nemotron-3-super...")
            content = nemotron_super(ZANE_SYSTEM_PROMPT, user_prompt)
            model_used = "nvidia-nemotron-3-super"

        if not content:
            # Tier 3 fallback: deepseek-v4-flash
            print("🔄 nemotron failed, trying deepseek-v4-flash...")
            content = deepseek_flash(ZANE_SYSTEM_PROMPT, user_prompt)
            if not content:
                content = deepseek_flash_requests(ZANE_SYSTEM_PROMPT, user_prompt)
            model_used = "nvidia-deepseek-v4-flash"

    elif tier == "premium":
        # Tier 3 flagship: nemotron-3-super (best reasoning)
        content = nemotron_super(ZANE_SYSTEM_PROMPT, user_prompt)
        model_used = "nvidia-nemotron-3-super"

        if not content:
            # Fallback to kimi
            print("🔄 nemotron failed, trying kimi-k2.6...")
            content = kimi_k26(ZANE_SYSTEM_PROMPT, user_prompt)
            model_used = "nvidia-kimi-fallback"

    if not content:
        raise Exception("All NVIDIA providers failed")

    # Extract metadata
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
        "safety_score": story.get("safety_score", 0),
    }

def extract_hype_meter(content: str) -> str:
    match = re.search(r'Hype Meter:\s*(\d+(?:\.\d+)?/10)', content, re.IGNORECASE)
    return match.group(1) if match else "5/10"

def extract_tldr(content: str) -> str:
    lines = content.split('\n')
    tldr_lines = []
    in_tldr = False
    for line in lines:
        if 'TL;DR' in line.upper() or 'TLDR' in line.upper():
            in_tldr = True
            continue
        if in_tldr and line.strip().startswith(('-', '•', '*')):
            tldr_lines.append(line.strip().lstrip('-•* ').strip())
        if in_tldr and len(tldr_lines) >= 3:
            break
    return ' '.join(tldr_lines) if tldr_lines else "No TL;DR generated"

def categorize_story(story: Dict, content: str) -> str:
    source = story.get("source", "")
    title_lower = story.get("title", "").lower()
    if "reddit_ai" in source or "ai" in title_lower or "agi" in title_lower:
        return "AI"
    elif "crypto" in title_lower or "bitcoin" in title_lower:
        return "Crypto"
    elif "leak" in title_lower or "leaked" in title_lower:
        return "Leaks"
    elif "reddit_futurology" in source:
        return "Weird Tech"
    else:
        return "News"

def get_image_for_story(story: Dict) -> str:
    try:
        res = requests.get(story['url'], timeout=10, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        match = re.search(r'<meta[^>]*property="og:image"[^>]*content="([^"]*)"', res.text)
        if match:
            return match.group(1)
    except:
        pass
    keywords = "+".join(story['title'].split()[:3])
    return f"https://source.unsplash.com/1200x630/?{keywords}"

def post_to_api(article: Dict) -> bool:
    API_ENDPOINT = os.getenv("API_ENDPOINT", "http://localhost:3000/api/post-news")
    API_SECRET_KEY = os.getenv("API_SECRET_KEY")
    if not API_SECRET_KEY:
        print("⚠️ API_SECRET_KEY missing")
        return False
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_SECRET_KEY}"
    }
    try:
        res = requests.post(API_ENDPOINT, json=article, headers=headers, timeout=30)
        if res.status_code == 200:
            print("✅ Article posted to API")
            return True
        else:
            print(f"❌ API error {res.status_code}: {res.text}")
            return False
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False

def main():
    print("=" * 60)
    print("TRUTHWORLDNEWS LLM ENGINE — NVIDIA OFFICIAL APIs")
    print("Tier 1: kimi-k2.6 | Tier 2: nemotron-3-super | Tier 3: deepseek-v4-flash")
    print("=" * 60)

    try:
        with open("stories_safe.json", "r", encoding="utf-8") as f:
            stories = json.load(f)
    except FileNotFoundError:
        print("❌ stories_safe.json not found. Run scraper + safety first.")
        return

    print(f"📥 Loaded {len(stories)} stories to process")

    for i, story in enumerate(stories, 1):
        print(f"\n{'='*60}")
        print(f"Processing story {i}/{len(stories)}: {story['title'][:60]}...")
        print(f"{'='*60}")

        score = story.get("score", 0)
        tier = "premium" if score > 100 else "flash"
        print(f"📊 Score: {score} → Tier: {tier}")

        try:
            article = generate_article(story, tier=tier)
            print(f"✅ Article generated ({len(article['content'])} chars)")
            print(f"🎯 Hype Meter: {article['hype_meter']}")
            print(f"📝 TL;DR: {article['tldr_summary'][:100]}...")

            if post_to_api(article):
                print("🚀 Article queued for review")
            else:
                with open(f"article_backup_{i}.json", "w") as f:
                    json.dump(article, f, indent=2)

        except Exception as e:
            print(f"❌ Failed to process story: {e}")
            continue

    print("\n" + "=" * 60)
    print("LLM Engine complete.")
    print("=" * 60)

if __name__ == "__main__":
    main()
