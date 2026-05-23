#!/usr/bin/env python3
"""Retry failed NVIDIA models with 120s timeout."""

import os, requests, sys
from openai import OpenAI

NVIDIA_KEY = os.getenv("NVIDIA_API_KEY")
if not NVIDIA_KEY:
    print("Set $env:NVIDIA_API_KEY first")
    sys.exit(1)

BASE = "https://integrate.api.nvidia.com/v1"
client = OpenAI(base_url=BASE, api_key=NVIDIA_KEY)

TEST_PROMPT = "Write a sarcastic 100-word headline and subheadline about AI hype."

def test_kimi():
    print("\nTESTING kimi-k2.6 (requests, 120s timeout)...")
    try:
        r = requests.post(
            f"{BASE}/chat/completions",
            headers={"Authorization": f"Bearer {NVIDIA_KEY}", "Content-Type": "application/json"},
            json={
                "model": "moonshotai/kimi-k2.6",
                "messages": [{"role": "user", "content": TEST_PROMPT}],
                "max_tokens": 200, "temperature": 0.85, "stream": False
            },
            timeout=120
        )
        data = r.json()
        text = data['choices'][0]['message']['content']
        print(f"PASS — {len(text)} chars\n{text[:200]}...")
        return True
    except Exception as e:
        print(f"FAIL — {e}")
        return False

def test_nemotron():
    print("\nTESTING nemotron-3-super (OpenAI client, 120s timeout)...")
    try:
        comp = client.chat.completions.create(
            model="nvidia/nemotron-3-super-120b-a12b",
            messages=[{"role": "user", "content": TEST_PROMPT}],
            max_tokens=200, temperature=0.85, stream=False,
            timeout=120
        )
        text = comp.choices[0].message.content
        print(f"PASS — {len(text)} chars\n{text[:200]}...")
        return True
    except Exception as e:
        print(f"FAIL — {e}")
        return False

def test_deepseek():
    print("\nTESTING deepseek-v4-flash (OpenAI client, 120s timeout)...")
    try:
        comp = client.chat.completions.create(
            model="deepseek-ai/deepseek-v4-flash",
            messages=[{"role": "user", "content": TEST_PROMPT}],
            max_tokens=200, temperature=0.85, stream=False,
            timeout=120
        )
        text = comp.choices[0].message.content
        print(f"PASS — {len(text)} chars\n{text[:200]}...")
        return True
    except Exception as e:
        print(f"FAIL — {e}")
        return False

if __name__ == "__main__":
    results = {
        "kimi-k2.6": test_kimi(),
        "nemotron-3-super": test_nemotron(),
        "deepseek-v4-flash": test_deepseek()
    }
    print("\n" + "="*50)
    for model, ok in results.items():
        print(f"{'PASS' if ok else 'FAIL'}: {model}")
