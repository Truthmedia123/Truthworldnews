/**
 * src/lib/custom-fields.ts
 *
 * Typed accessors for the 8 Ghost custom fields.
 * Ghost stores custom fields in `codeinjection_metadata` (a JSON bag) when
 * the theme doesn't declare them as native post attributes.
 *
 * These accessors handle both cases (direct attribute OR metadata bag) so
 * the rest of the codebase doesn't need to care.
 */

import type { GhostPost } from './ghost';

// ---------------------------------------------------------------------------
// Source type (parsed from JSON string in `sources` field)
// ---------------------------------------------------------------------------

export interface ArticleSource {
  title: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Hype meter (5-level editorial scale, repo-aware)
// ---------------------------------------------------------------------------

export type HypeLevel = 'astronomical' | 'fever-pitch' | 'medium-buzz' | 'low-hum' | 'dead-on-arrival';

export interface HypeLabel {
  level: HypeLevel;
  label: string;
  description: string;
  color: string;       // tailwind class
  bg: string;          // tailwind class
  emoji: string;
}

const HYPE_MAP: Record<HypeLevel, Omit<HypeLabel, 'level'>> = {
  'astronomical': {
    label: 'Astronomical Hype',
    description: 'The hype machine is in full meltdown. Buy a helmet.',
    color: 'text-white',
    bg: 'bg-red-600',
    emoji: '🔥',
  },
  'fever-pitch': {
    label: 'Fever Pitch',
    description: 'Everyone is losing their minds. Take a breath.',
    color: 'text-black',
    bg: 'bg-[#FFFF00]',
    emoji: '🚨',
  },
  'medium-buzz': {
    label: 'Medium Buzz',
    description: 'Solid chatter. Not quite viral, not quite dead.',
    color: 'text-black',
    bg: 'bg-orange-300',
    emoji: '📈',
  },
  'low-hum': {
    label: 'Low Hum',
    description: 'A few people are talking. Mostly to themselves.',
    color: 'text-white',
    bg: 'bg-gray-500',
    emoji: '🥱',
  },
  'dead-on-arrival': {
    label: 'Dead on Arrival',
    description: 'Nobody cares. Not even the person who wrote it.',
    color: 'text-white',
    bg: 'bg-zinc-800',
    emoji: '💀',
  },
};

export function getHypeLabel(post: GhostPost): HypeLabel {
  const raw = post.hype_meter?.toLowerCase().trim() ?? '';
  // Map common variations
  let level: HypeLevel;
  if (raw.includes('astronomical') || raw === '10/10' || raw === '10') level = 'astronomical';
  else if (raw.includes('fever') || raw.includes('9') || raw === '8/10' || raw === '8') level = 'fever-pitch';
  else if (raw.includes('medium') || raw.includes('buzz') || raw === '7/10' || raw === '6/10' || raw === '5/10') level = 'medium-buzz';
  else if (raw.includes('low') || raw.includes('hum') || raw === '4/10' || raw === '3/10') level = 'low-hum';
  else if (raw.includes('dead') || raw.includes('arrival') || raw === '2/10' || raw === '1/10' || raw === '0/10') level = 'dead-on-arrival';
  else level = 'medium-buzz';

  return { level, ...HYPE_MAP[level] };
}

// ---------------------------------------------------------------------------
// Safety score (4-level editorial scale)
// ---------------------------------------------------------------------------

export type SafetyLevel = 'clean' | 'minor-concerns' | 'flagged' | 'blocked';

export interface SafetyLabel {
  level: SafetyLevel;
  label: string;
  description: string;
  color: string;
  bg: string;
  emoji: string;
}

const SAFETY_MAP: Record<SafetyLevel, Omit<SafetyLabel, 'level'>> = {
  'clean': {
    label: 'Clean',
    description: 'Sources verified, no red flags.',
    color: 'text-black',
    bg: 'bg-green-400',
    emoji: '✓',
  },
  'minor-concerns': {
    label: 'Minor Concerns',
    description: 'Mostly solid. One source is shaky.',
    color: 'text-black',
    bg: 'bg-yellow-400',
    emoji: '⚠',
  },
  'flagged': {
    label: 'Flagged for Review',
    description: 'Multiple sources disputed. Read with skepticism.',
    color: 'text-white',
    bg: 'bg-orange-600',
    emoji: '⚠',
  },
  'blocked': {
    label: 'Blocked',
    description: 'Failed safety check. Should not be published.',
    color: 'text-white',
    bg: 'bg-red-700',
    emoji: '✗',
  },
};

export function getSafetyLabel(post: GhostPost): SafetyLabel | null {
  const score = post.safety_score;
  if (score === undefined || score === null) return null;

  let level: SafetyLevel;
  if (score >= 90) level = 'clean';
  else if (score >= 70) level = 'minor-concerns';
  else if (score >= 40) level = 'flagged';
  else level = 'blocked';

  return { level, ...SAFETY_MAP[level] };
}

// ---------------------------------------------------------------------------
// TL;DR summary
// ---------------------------------------------------------------------------

export function getTldr(post: GhostPost): string | null {
  return post.tldr_summary ?? null;
}

/**
 * Parse the TL;DR into bullet points if it contains newlines or "•" or "-".
 * Otherwise returns the raw string as a single-bullet array.
 */
export function getTldrBullets(post: GhostPost): string[] {
  const tldr = getTldr(post);
  if (!tldr) return [];
  // Split on newlines, "•", or "- " (but not in the middle of a word)
  const bullets = tldr
    .split(/\n|•\s*|(?<=\s)-\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  return bullets.length > 0 ? bullets : [tldr.trim()];
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export function getSources(post: GhostPost): ArticleSource[] {
  if (!post.sources) return [];
  try {
    const parsed = JSON.parse(post.sources);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Rumor flag
// ---------------------------------------------------------------------------

export function isRumor(post: GhostPost): boolean {
  return post.is_rumor === true;
}

// ---------------------------------------------------------------------------
// Content hash (provenance)
// ---------------------------------------------------------------------------

export function getContentHash(post: GhostPost): string | null {
  return post.content_hash ?? null;
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

export function hasVideo(post: GhostPost): boolean {
  return Boolean(post.video_url) && post.video_url!.trim() !== '';
}

export function getVideoUrl(post: GhostPost): string | null {
  return post.video_url ?? null;
}

export function isVideoRequested(post: GhostPost): boolean {
  return post.video_requested === true;
}

export function getVideoScript(post: GhostPost): string | null {
  return post.video_script ?? null;
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export function getReviewedBy(post: GhostPost): string | null {
  return post.reviewed_by ?? null;
}

export function getReviewedAt(post: GhostPost): string | null {
  return post.reviewed_at ?? null;
}
