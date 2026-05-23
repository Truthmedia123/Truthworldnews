#!/usr/bin/env python3
"""Test all 3 NVIDIA models with a sample Zane Edge prompt."""

import os
from scripts.llm_engine import kimi_k26, nemotron_super, deepseek_flash, ZANE_SYSTEM_PROMPT

# Ensure API key is set
if not os.getenv("NVIDIA_API_KEY"):
    print("❌ Set NVIDIA_API_KEY environment variable first")
    exit(1)

test_prompt = """STORY TYPE: Breaking News
TOPIC: SpaceX Starship explodes during test flight over Texas
SNIPPET: SpaceX's latest Starship prototype exploded during a test flight. The FAA has grounded the fleet. Elon Musk tweeted "Rapid unscheduled disassembly."

Write a 700-word Zane Edge article with headline, TL;DR, Hype Meter, and kicker."""

print("=" * 70)
print("TESTING KIMI K2.6 (Tier 1)")
print("=" * 70)
result = kimi_k26(ZANE_SYSTEM_PROMPT, test_prompt)
if result:
    print(result[:800])
    print(f"\n... ({len(result)} chars total)")
else:
    print("❌ FAILED")

print("\n" + "=" * 70)
print("TESTING NEMOTRON 3 SUPER 120B (Tier 2/3)")
print("=" * 70)
result = nemotron_super(ZANE_SYSTEM_PROMPT, test_prompt)
if result:
    print(result[:800])
    print(f"\n... ({len(result)} chars total)")
else:
    print("❌ FAILED")

print("\n" + "=" * 70)
print("TESTING DEEPSEEK V4-FLASH (Tier 3 Fallback)")
print("=" * 70)
result = deepseek_flash(ZANE_SYSTEM_PROMPT, test_prompt)
if result:
    print(result[:800])
    print(f"\n... ({len(result)} chars total)")
else:
    print("❌ FAILED")
