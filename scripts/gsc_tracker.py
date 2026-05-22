#!/usr/bin/env python3
"""
Google Search Console API Tracker
Fetches ranking data and stores in Supabase.
Run daily via GitHub Actions.
"""

import os
import json
from datetime import datetime, timedelta, timezone
from google.oauth2 import service_account
from googleapiclient.discovery import build
import requests

# -- CONFIG ------------------------------------------------------
GSC_CREDENTIALS_JSON = os.getenv("GSC_CREDENTIALS_JSON")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SITE_URL = "https://truthworldnews.com/"

def get_gsc_service():
    """Authenticate with GSC API."""
    if not GSC_CREDENTIALS_JSON:
        print("GSC_CREDENTIALS_JSON missing")
        return None
    
    credentials_info = json.loads(GSC_CREDENTIALS_JSON)
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info,
        scopes=['https://www.googleapis.com/auth/webmasters.readonly']
    )
    return build('searchconsole', 'v1', credentials=credentials)

def fetch_search_analytics(service, days=7):
    """Fetch search analytics data."""
    if not service:
        return []
    
    end_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime('%Y-%m-%d')
    
    request = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['query', 'page'],
        'rowLimit': 5000
    }
    
    response = service.searchanalytics().query(siteUrl=SITE_URL, body=request).execute()
    return response.get('rows', [])

def store_in_supabase(data):
    """Store GSC data in Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase credentials missing")
        return
    
    records = []
    for row in data:
        records.append({
            "query": row['keys'][0],
            "page": row['keys'][1],
            "clicks": row.get('clicks', 0),
            "impressions": row.get('impressions', 0),
            "ctr": round(row.get('ctr', 0), 4),
            "position": round(row.get('position', 0), 2),
            "date": datetime.now(timezone.utc).isoformat(),
        })
    
    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/gsc_data",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        json=records,
        timeout=30
    )
    
    if res.status_code in [200, 201]:
        print(f"Stored {len(records)} GSC records")
    else:
        print(f"Failed to store: {res.status_code} {res.text}")

def main():
    print("=" * 60)
    print("GSC TRACKER")
    print("=" * 60)
    
    service = get_gsc_service()
    data = fetch_search_analytics(service, days=7)
    
    print(f"Fetched {len(data)} rows from GSC")
    
    if data:
        store_in_supabase(data)
        
        top_queries = sorted(data, key=lambda x: x.get('clicks', 0), reverse=True)[:10]
        print("\nTop Queries:")
        for row in top_queries:
            print(f"  {row['keys'][0][:50]}... | Clicks: {row.get('clicks', 0)} | Pos: {round(row.get('position', 0), 1)}")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
