# Video Pipeline Prep — TruthWorldNews

**Target:** Month 6 (November 2026)

---

## Tool

- **Repo:** https://github.com/browser-use/video-use
- **Cost:** ~$0.30 per 10-min video (ElevenLabs Scribe)
- **Features:** Auto-cut filler words, color grade, subtitle burn, animation overlays
- **Tool:** video-use (Browser Use team)

## Setup Commands (for Month 6)

```bash
git clone https://github.com/browser-use/video-use.git ~/video-use
cd ~/video-use && uv sync && brew install ffmpeg yt-dlp
cp .env.example .env
# Add ELEVENLABS_API_KEY
ln -sfn ~/video-use ~/.claude/skills/video-use
```

## Content Multiplier

From 1 video recording, produce:

| Output | Quantity | Platform |
|--------|----------|----------|
| YouTube video | 1 (10 min) | YouTube |
| YouTube Shorts | 5 (60 sec each) | YouTube |
| Full article | 1 (transcript + commentary) | TruthWorldNews |
| Newsletter issue | 1 | Email |
| Twitter threads | 5 | X/Twitter |
| LinkedIn posts | 5 | LinkedIn |
| TikToks | 5 | TikTok |

## Workflow

1. Record 10-min rant on trending topic
2. Drop in `~/videos/`
3. Run: `claude → "edit this into a 30-second Short with bold subtitles"`
4. Review `edit/final.mp4`
5. Cross-post to all platforms
