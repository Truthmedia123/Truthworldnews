import os
import requests
import json
import feedparser
from bs4 import BeautifulSoup
import google.generativeai as genai

# ==========================================
# CONFIGURATION
# ==========================================
# 1. Set your Gemini API Key
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY"))

# 2. Set your Next.js API endpoint and Secret Key
API_ENDPOINT = "http://localhost:3000/api/post-news"
API_SECRET_KEY = os.environ.get("API_SECRET_KEY", "YOUR_SECRET_KEY")

# 3. Unsplash Access Key (for image fallback)
UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "YOUR_UNSPLASH_KEY")

# 4. Target RSS Feed
RSS_FEED_URL = "http://feeds.bbci.co.uk/news/world/rss.xml"

def get_og_image(url):
    """Attempt to scrape the og:image from the article URL."""
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content']
    except Exception as e:
        print(f"Failed to scrape og:image: {e}")
    return None

def fallback_image_search(query):
    """Use Unsplash API to find a high-contrast image if no og:image is found."""
    if not UNSPLASH_ACCESS_KEY or UNSPLASH_ACCESS_KEY == "YOUR_UNSPLASH_KEY":
        # Return a reliable Unsplash Source placeholder if no API key is provided
        return f"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"

    print(f"Fetching Unsplash fallback image for query: {query}")
    try:
        res = requests.get(
            f"https://api.unsplash.com/search/photos",
            params={"query": query, "per_page": 1, "orientation": "landscape"},
            headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}
        )
        data = res.json()
        if data.get('results') and len(data['results']) > 0:
            return data['results'][0]['urls']['regular']
    except Exception as e:
        print(f"Unsplash API error: {e}")
        
    return "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"

def generate_viral_content(title, text_snippet):
    """Use Gemini 1.5 Flash to generate the article body, TLDR, and TikTok script."""
    prompt = f"""
    You are the Lead Writer for 'Truth World News', an aggressive, brutalist, cynical viral news platform.
    Write a complete payload based on the following news:
    TITLE: {title}
    SNIPPET: {text_snippet}

    Respond ONLY in valid JSON format with the following keys:
    1. "content": The full brutalist article body (3-4 paragraphs). Make it cynical, slightly outraged, and highly engaging.
    2. "tldr_summary": A 2-sentence blunt TL;DR.
    3. "video_script": A 45-second TikTok/Reels voice-over script formatted exactly like this:
       [0:00 - Hook]: (text here)
       [0:10 - The Twist]: (text here)
       [0:30 - The Cynical TL;DR]: (text here)
    4. "image_description": A 3-5 word high-contrast visual description to search for an image (e.g., 'dark hacker silhouette', 'angry politician').
    """

    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    
    # Clean up the markdown JSON blocks if present
    output = response.text.replace('```json', '').replace('```', '').strip()
    return json.loads(output)

def process_feed():
    print(f"Fetching RSS Feed: {RSS_FEED_URL}")
    feed = feedparser.parse(RSS_FEED_URL)
    
    # Process only the first article for demonstration
    entry = feed.entries[0]
    title = entry.title
    link = entry.link
    snippet = entry.get('summary', '')

    print(f"\nProcessing: {title}")

    # 1. Sourcing Image
    print("Extracting og:image...")
    image_url = get_og_image(link)

    # 2. Generating AI Content
    print("Generating Viral Content & Social Scripts via Gemini...")
    try:
        ai_data = generate_viral_content(title, snippet)
    except Exception as e:
        print(f"Failed to generate AI content: {e}")
        return

    # 3. Fallback Image check
    if not image_url:
        print("No og:image found. Using Unsplash fallback...")
        image_url = fallback_image_search(ai_data.get('image_description', 'breaking news'))

    # 4. Construct Payload
    payload = {
        "title": title,
        "content": ai_data['content'],
        "tldr_summary": ai_data['tldr_summary'],
        "image_url": image_url,
        "category": "WORLD",
        "video_script": ai_data['video_script'],
        "image_description": ai_data['image_description']
    }

    # 5. Push to Truth World News API
    print("Pushing to Next.js API Endpoint...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_SECRET_KEY}"
    }
    
    try:
        res = requests.post(API_ENDPOINT, json=payload, headers=headers)
        if res.status_code == 200:
            print("✅ Successfully injected article to Supabase!")
            print(f"Result: {res.json()}")
        else:
            print(f"❌ API Error {res.status_code}: {res.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    process_feed()
