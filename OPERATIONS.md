# TruthWorldNews Operations Manual
## Version 1.0 | May 2026

---

## 1. EDITORIAL WORKFLOW

### Daily Pipeline (Automated)
1. **Scrape** (every 4h) → 5 sources, 45 stories
2. **Safety** → Toxicity, source verification, clickbait check
3. **LLM Draft** → Tiered routing (DeepSeek → Groq → Claude)
4. **Human Review** → Admin dashboard (/admin/review)
5. **Publish** → ISR regenerate, social queue, newsletter

### Human Review Checklist
- [ ] Read full article, not just TL;DR
- [ ] Verify 2+ sources (or RUMOR flag is appropriate)
- [ ] Check Zane Edge voice consistency (not generic AI-speak)
- [ ] Verify Hype Meter reflects institutional absurdity
- [ ] Check for banned words: "delve", "leverage", "robust", "landscape", "paradigm"
- [ ] Verify inline citations exist
- [ ] Confirm TL;DR has 3 bullets
- [ ] Check image is relevant and not placeholder
- [ ] Add editorial notes if significant changes made
- [ ] Approve or reject with reason

### Voice Consistency Rules
- Sarcastic but not cruel
- Punch up at power, not down at people
- Short punchy sentences + occasional long rants
- Contractions: I've, don't, can't
- Occasional fragments. For emphasis.
- First-person anecdotes: "I remember when..."
- No "Furthermore", "Moreover", "In conclusion"
- 1-2 intentional imperfections per article

---

## 2. CONTENT CALENDAR

| Day | Focus | Platforms |
|-----|-------|-----------|
| Monday | AI/Big Tech | Twitter, LinkedIn, Newsletter draft |
| Tuesday | Crypto/Web3 | Twitter, Threads, Bluesky |
| Wednesday | Weird Tech | Twitter, LinkedIn, TikTok (video) |
| Thursday | Leaks/Investigations | Twitter, Threads, Newsletter send |
| Friday | Rants/Opinion | Twitter, LinkedIn, YouTube (video) |
| Saturday | Community | Reddit, HN, engagement replies |
| Sunday | Planning | Analytics review, week ahead prep |

---

## 3. HIRING ROADMAP

### Month 12: Part-Time Editor
**Role:** Content Review & Voice Consistency
**Hours:** 10/week
**Rate:** $500/month
**Responsibilities:**
- Review 20 articles/week
- Maintain Zane Edge voice consistency
- Fact-check claims against sources
- Write editorial notes

### Month 18: Full-Time Editor
**Role:** Editorial Director
**Hours:** 40/week
**Rate:** $3,000/month
**Responsibilities:**
- Manage editorial calendar
- Train part-time reviewers
- Handle corrections and disputes
- Liaison with sources and PR

### Month 24: Social Media Manager
**Role:** Distribution & Community
**Hours:** 20/week
**Rate:** $1,500/month
**Responsibilities:**
- Manage BrightBean Studio queue
- Reply to comments/mentions across platforms
- A/B test social copy
- Grow newsletter subscriber base

### Month 30: Newsletter Writer
**Role:** "Zane's Week in Review" + Sponsored Content
**Hours:** 10/week
**Rate:** $800/month
**Responsibilities:**
- Write weekly digest
- Manage sponsor relationships
- A/B test subject lines
- Grow subscriber base to 10,000

---

## 4. ANALYTICS REVIEW (Weekly)

### Metrics to Track
| Metric | Tool | Target |
|--------|------|--------|
| Organic traffic | GA4 | 10% week-over-week growth |
| Top queries | GSC API | Position <10 for 5+ keywords |
| Newsletter subscribers | ConvertKit | 10% month-over-month growth |
| Social engagement | BrightBean | 5% engagement rate |
| Revenue | AdSense + affiliates | $1,000/month by Month 12 |
| Content velocity | Internal | 120 articles/month |

### Review Process (Every Sunday)
1. Pull GSC data → top queries, position changes
2. Check GA4 → traffic sources, bounce rate, time on page
3. Review social queue performance → best/worst posts
4. Newsletter metrics → open rate, click rate, unsubscribes
5. Revenue → AdSense RPM, affiliate conversions
6. Plan next week → double down on what's working

---

## 5. FAILURE PROTOCOLS

### Pipeline Breaks
1. Check GitHub Actions logs
2. Verify API keys not expired
3. Check Supabase connection
4. Run pipeline manually: `python scripts/pipeline.py`
5. If LLM fails → fallback to next tier
6. If scraper fails → use BBC RSS fallback

### AdSense Issues
1. Check ads.txt is accessible
2. Verify cookie consent working
3. Check for policy violations in recent articles
4. Contact AdSense support with editorial policy
5. Document all communications

### Voice Drift Detected
1. Run 5 articles through voice checker
2. Compare to Part 1 system prompt
3. Update system prompt if needed
4. Re-train editor on voice rules
5. Spot-check next 10 articles

### Google Penalty
1. Check GSC for manual actions
2. Review recent content for quality issues
3. Verify no scaled content abuse
4. Submit reconsideration request
5. Increase human review rigor

---

## 6. TOOLS & ACCESS

| Tool | Purpose | Owner | Cost |
|------|---------|-------|------|
| Netlify Starter | Hosting | CTO | $0 |
| Supabase Free | Database | CTO | $0 |
| DeepSeek API | LLM Tier 1 | CTO | ~$0.32/mo |
| Groq API | LLM Tier 2 | CTO | $0 |
| Claude API | LLM Tier 3 | CTO | ~$1.00/mo |
| BrightBean Studio | Social | SMM | $0 (self-hosted) |
| ConvertKit Free | Newsletter | Newsletter | $0 |
| Google Analytics 4 | Analytics | CTO | $0 |
| Microsoft Clarity | Heatmaps | CTO | $0 |
| GSC API | Rank tracking | CTO | $0 |

---

## 7. EMERGENCY CONTACTS

| Role | Name | Contact |
|------|------|---------|
| CTO/Founder | You | [your email] |
| Domain Registrar | Namecheap/Cloudflare | Support portal |
| Hosting | Netlify | Support ticket |
| Database | Supabase | Support ticket |
| AdSense | Google | Publisher support |
