#!/usr/bin/env python3
"""
TruthWorldNews Newsletter Generator
Auto-generates weekly "Zane's Week in Review" digest.
"""

import os
import requests
from datetime import datetime, timedelta, timezone
from typing import Dict, List

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
CONVERTKIT_API_KEY = os.getenv("CONVERTKIT_API_KEY")
CONVERTKIT_FORM_ID = os.getenv("CONVERTKIT_FORM_ID")

def get_weekly_articles() -> List[Dict]:
    """Fetch top articles from last 7 days."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []

    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/posts?select=*&status=eq.published&is_published=eq.true&created_at=gte.{week_ago}&order=created_at.desc&limit=10",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        },
        timeout=15
    )
    if res.status_code == 200:
        return res.json()
    return []

def generate_newsletter(articles: List[Dict]) -> str:
    """Generate HTML newsletter content."""
    if not articles:
        return "<p>No articles this week. The pipeline is running.</p>"

    top_articles = articles[:5]
    now = datetime.now().strftime('%B %d, %Y')

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zane's Week in Review</title>
</head>
<body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
<header style="text-align: center; padding: 20px 0; border-bottom: 2px solid #ef4444;">
<h1 style="color: #ef4444; margin: 0;">ZANE'S WEEK IN REVIEW</h1>
<p style="color: #9ca3af; margin: 5px 0;">The week in tech, unfiltered.</p>
<p style="color: #6b7280; font-size: 12px;">{now}</p>
</header>
<div style="background: #1f2937; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
<p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; margin: 0 0 5px 0;">SPONSORED</p>
<p style="color: #fff; margin: 0; font-size: 14px;">
<strong>Your brand here.</strong> Reach 1,000+ cynical tech readers.
<a href="mailto:sponsors@truthworldnews.com" style="color: #ef4444;">Contact us</a>
</p>
</div>
<main style="padding: 20px 0;">
"""

    for i, article in enumerate(top_articles, 1):
        url = f"https://truthworldnews.com/article/{article['id']}/"
        hype = article.get('hype_meter', 'N/A')
        category = article.get('category', 'News')
        summary = article.get('tldr_summary', '')[:150]

        html += f"""
<article style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #374151;">
<span style="color: #ef4444; font-size: 12px; font-weight: bold; text-transform: uppercase;">{category}</span>
<h2 style="margin: 5px 0; font-size: 20px;">
<a href="{url}" style="color: #fff; text-decoration: none;">{article['title']}</a>
</h2>
<p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">{summary}...</p>
<div style="margin-top: 10px;">
<span style="background: #ef4444; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">HYPE: {hype}</span>
<a href="{url}" style="color: #ef4444; font-size: 12px; margin-left: 10px; text-decoration: underline;">Read more &rarr;</a>
</div>
</article>
"""

    html += """</main>
<footer style="text-align: center; padding: 20px 0; border-top: 2px solid #374151; color: #6b7280; font-size: 12px;">
<p>Truth World News &mdash; The cynical antidote to boring mainstream media.</p>
<p>
<a href="https://truthworldnews.com" style="color: #ef4444;">Visit Site</a> |
<a href="https://truthworldnews.com/rss.xml" style="color: #ef4444;">RSS</a>
</p>
<p style="margin-top: 10px;">You're receiving this because you subscribed to Zane's Week in Review.</p>
</footer>
</body>
</html>"""

    return html

def save_newsletter(html: str):
    """Save newsletter to file."""
    filename = f"newsletter_{datetime.now().strftime('%Y-%m-%d')}.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Newsletter saved to {filename}")

def main():
    print("=" * 60)
    print("NEWSLETTER GENERATOR")
    print("=" * 60)

    articles = get_weekly_articles()
    print(f"Found {len(articles)} articles from last 7 days")

    html = generate_newsletter(articles)
    save_newsletter(html)

    print("\n" + "=" * 60)
    print("Newsletter ready for sending.")
    print("=" * 60)

if __name__ == "__main__":
    main()
