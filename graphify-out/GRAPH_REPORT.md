# Graph Report - .  (2026-05-22)

## Corpus Check
- Corpus is ~40,273 words - fits in a single context window. You may not need a graph.

## Summary
- 213 nodes · 206 edges · 13 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_build_user_prompt(), categorize_story(), claude_sonnet()|build_user_prompt(), categorize_story(), claude_sonnet()]]
- [[_COMMUNITY_filter_stories(), get_content_hash(), is_duplicate()|filter_stories(), get_content_hash(), is_duplicate()]]
- [[_COMMUNITY_check_freshness(), check_toxicity(), detect_clickbait()|check_freshness(), check_toxicity(), detect_clickbait()]]
- [[_COMMUNITY_generate_platform_content(), get_recent_articles(), inser...|generate_platform_content(), get_recent_articles(), inser...]]
- [[_COMMUNITY_AdSlot(), ConditionalAds(), handleSavePreferences()|AdSlot(), ConditionalAds(), handleSavePreferences()]]
- [[_COMMUNITY_fetch_search_analytics(), get_gsc_service(), main()|fetch_search_analytics(), get_gsc_service(), main()]]
- [[_COMMUNITY_generate_newsletter(), get_weekly_articles(), main()|generate_newsletter(), get_weekly_articles(), main()]]
- [[_COMMUNITY_fallback_image_search(), generate_viral_content(), get_og...|fallback_image_search(), generate_viral_content(), get_og...]]
- [[_COMMUNITY_generate_report(), get_article_stats(), get_gsc_stats()|generate_report(), get_article_stats(), get_gsc_stats()]]
- [[_COMMUNITY_checkUser(), deletePost(), fetchData()|checkUser(), deletePost(), fetchData()]]
- [[_COMMUNITY_generateMetadata(), generateStaticParams(), QuizPage()|generateMetadata(), generateStaticParams(), QuizPage()]]
- [[_COMMUNITY_main(), pipeline.py, run_distribution()|main(), pipeline.py, run_distribution()]]
- [[_COMMUNITY_approvePost(), fetchPosts(), saveEdit()|approvePost(), fetchPosts(), saveEdit()]]

## God Nodes (most connected - your core abstractions)
1. `generate_article()` - 11 edges
2. `process_story()` - 7 edges
3. `filter_stories()` - 6 edges
4. `useCookieConsent()` - 6 edges
5. `generate_platform_content()` - 5 edges
6. `queue_to_brightbean()` - 5 edges
7. `main()` - 5 edges
8. `main()` - 5 edges
9. `generate_report()` - 4 edges
10. `save_local_queue()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `AdSlot()` --calls--> `useCookieConsent()`  [INFERRED]
  src\components\AdSlot.tsx → src\hooks\useCookieConsent.ts
- `ConditionalAds()` --calls--> `useCookieConsent()`  [INFERRED]
  src\components\ConditionalAds.tsx → src\hooks\useCookieConsent.ts
- `generateMetadata()` --calls--> `generateSeoMeta()`  [INFERRED]
  src\app\article\[id]\page.tsx → src\lib\seo.ts

## Communities

### Community 0 - "build_user_prompt(), categorize_story(), claude_sonnet()"
Cohesion: 0.18
Nodes (17): build_user_prompt(), categorize_story(), claude_sonnet(), deepseek_flash(), extract_hype_meter(), extract_tldr(), generate_article(), get_image_for_story() (+9 more)

### Community 1 - "filter_stories(), get_content_hash(), is_duplicate()"
Cohesion: 0.19
Nodes (15): filter_stories(), get_content_hash(), is_duplicate(), main(), Scrape BBC World RSS feed., Score based on engagement, freshness, and source weight., Remove duplicates, low-engagement, and stale stories., Generate 16-char hash for deduplication. (+7 more)

### Community 2 - "check_freshness(), check_toxicity(), detect_clickbait()"
Cohesion: 0.21
Nodes (13): check_freshness(), check_toxicity(), detect_clickbait(), get_source_credibility(), main(), process_story(), Rate source credibility 1-10., Detect clickbait patterns. Returns (is_clickbait, score). (+5 more)

### Community 3 - "generate_platform_content(), get_recent_articles(), inser..."
Cohesion: 0.26
Nodes (11): generate_platform_content(), get_recent_articles(), insert_affiliate_links(), main(), queue_to_brightbean(), Generate platform-specific post content., Queue posts to BrightBean Studio., Save to local JSON queue as fallback. (+3 more)

### Community 4 - "AdSlot(), ConditionalAds(), handleSavePreferences()"
Cohesion: 0.24
Nodes (3): AdSlot(), ConditionalAds(), useCookieConsent()

### Community 5 - "fetch_search_analytics(), get_gsc_service(), main()"
Cohesion: 0.36
Nodes (7): fetch_search_analytics(), get_gsc_service(), main(), Authenticate with GSC API., Fetch search analytics data., Store GSC data in Supabase., store_in_supabase()

### Community 6 - "generate_newsletter(), get_weekly_articles(), main()"
Cohesion: 0.36
Nodes (7): generate_newsletter(), get_weekly_articles(), main(), Save newsletter to file., Fetch top articles from last 7 days., Generate HTML newsletter content., save_newsletter()

### Community 7 - "fallback_image_search(), generate_viral_content(), get_og..."
Cohesion: 0.36
Nodes (7): fallback_image_search(), generate_viral_content(), get_og_image(), process_feed(), Attempt to scrape the og:image from the article URL., Use Unsplash API to find a high-contrast image if no og:image is found., Use Gemini 1.5 Flash to generate the article body, TLDR, and TikTok script.

### Community 8 - "generate_report(), get_article_stats(), get_gsc_stats()"
Cohesion: 0.38
Nodes (6): generate_report(), get_article_stats(), get_gsc_stats(), Get article publication stats., Get Google Search Console stats., Generate weekly analytics report.

### Community 9 - "checkUser(), deletePost(), fetchData()"
Cohesion: 0.38
Nodes (3): deletePost(), fetchData(), togglePublish()

### Community 10 - "generateMetadata(), generateStaticParams(), QuizPage()"
Cohesion: 0.33
Nodes (3): generateMetadata(), generateStaticParams(), generateSeoMeta()

### Community 11 - "main(), pipeline.py, run_distribution()"
Cohesion: 0.6
Nodes (5): main(), run_distribution(), run_llm(), run_safety(), run_scraper()

### Community 12 - "approvePost(), fetchPosts(), saveEdit()"
Cohesion: 0.83
Nodes (3): approvePost(), fetchPosts(), saveEdit()

## Knowledge Gaps
- **36 isolated node(s):** `Get article publication stats.`, `Get Google Search Console stats.`, `Generate weekly analytics report.`, `Insert affiliate links into post text.`, `Fetch recently published articles from Supabase.` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `useCookieConsent()` (e.g. with `AdSlot()` and `ConditionalAds()`) actually correct?**
  _`useCookieConsent()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Get article publication stats.`, `Get Google Search Console stats.`, `Generate weekly analytics report.` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._