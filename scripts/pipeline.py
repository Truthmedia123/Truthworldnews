#!/usr/bin/env python3
"""
TruthWorldNews Full Pipeline
Scrape -> LLM Draft -> API Post
"""

import subprocess
import sys
from datetime import datetime, timezone

def run_scraper():
    print("=" * 60)
    print("STEP 1: SCRAPING")
    print("=" * 60)
    result = subprocess.run([sys.executable, "scripts/scraper.py"], capture_output=False)
    return result.returncode == 0

def run_safety():
    print("\n" + "=" * 60)
    print("STEP 1.5: SAFETY CHECK")
    print("=" * 60)
    result = subprocess.run([sys.executable, "scripts/safety_layer.py"], capture_output=False)
    return result.returncode == 0

def run_llm():
    print("\n" + "=" * 60)
    print("STEP 2: LLM DRAFT GENERATION")
    print("=" * 60)
    result = subprocess.run([sys.executable, "scripts/llm_engine.py"], capture_output=False)
    return result.returncode == 0

def run_distribution():
    print("\n" + "=" * 60)
    print("STEP 3: DISTRIBUTION")
    print("=" * 60)
    result = subprocess.run([sys.executable, "scripts/distribute.py"], capture_output=False)
    return result.returncode == 0

def main():
    print("=" * 60)
    print(f"TRUTHWORLDNEWS PIPELINE -- {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    # Step 1: Scrape
    if not run_scraper():
        print("Scraper failed. Stopping.")
        return 1

    # Step 1.5: Safety check
    if not run_safety():
        print("Safety layer failed but continuing...")

    # Step 2: Generate articles (reads stories_safe.json)
    if not run_llm():
        print("LLM engine failed. Stopping.")
        return 1

    # Step 3: Distribution
    if not run_distribution():
        print("Distribution failed but continuing...")

    print("\n" + "=" * 60)
    print("FULL PIPELINE COMPLETE")
    print("Check admin dashboard for new drafts.")
    print("=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())
