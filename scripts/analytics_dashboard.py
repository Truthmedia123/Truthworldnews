#!/usr/bin/env python3
"""
TruthWorldNews Analytics Dashboard
Generates weekly performance report from all data sources.
"""

import os
import json
from datetime import datetime, timedelta
import requests

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def get_article_stats():
    """Get article publication stats."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {}

    week_ago = (datetime.now() - timedelta(days=7)).isoformat()

    # Total articles
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/posts?select=count",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        timeout=10
    )
    total = res.json()[0]["count"] if res.json() else 0

    # This week's articles
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/posts?select=count&created_at=gte.{week_ago}",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        timeout=10
    )
    this_week = res.json()[0]["count"] if res.json() else 0

    # By category
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/posts?select=category,count&groupby=category",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        timeout=10
    )
    by_category = res.json() if res.json() else []

    return {
        "total_articles": total,
        "this_week": this_week,
        "by_category": by_category,
    }

def get_gsc_stats():
    """Get Google Search Console stats."""
    # This would query the gsc_data table
    # For now, return placeholder
    return {
        "top_queries": ["truth world news", "zane edge", "ai news cynical"],
        "avg_position": 15.5,
        "total_clicks": 120,
        "total_impressions": 5000,
    }

def generate_report():
    """Generate weekly analytics report."""
    articles = get_article_stats()
    gsc = get_gsc_stats()

    report = f"""
# TruthWorldNews Weekly Report
## Week of {datetime.now().strftime('%B %d, %Y')}

### Content Velocity
- Total articles: {articles.get('total_articles', 0)}
- Published this week: {articles.get('this_week', 0)}
- Target: 28/week (4/day)

### SEO Performance
- Avg position: {gsc.get('avg_position', 'N/A')}
- Total clicks: {gsc.get('total_clicks', 0)}
- Total impressions: {gsc.get('total_impressions', 0)}
- Top queries: {', '.join(gsc.get('top_queries', []))}

### Revenue
- AdSense: $TBD (pending activation)
- Affiliates: $TBD (pending tracking)
- Newsletter sponsors: $TBD (pending 1,000 subs)

### Action Items
- [ ] Publish {28 - articles.get('this_week', 0)} more articles this week
- [ ] Optimize for top queries
- [ ] Grow newsletter subscriber base

---
Generated: {datetime.now().isoformat()}
"""

    # Save report
    filename = f"weekly_report_{datetime.now().strftime('%Y-%m-%d')}.md"
    with open(filename, "w") as f:
        f.write(report)

    print(f"📊 Report saved to {filename}")
    print(report)

if __name__ == "__main__":
    generate_report()
