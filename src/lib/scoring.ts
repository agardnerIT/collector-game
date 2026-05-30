export interface ScoreResult {
  points: number;
  streakBonus: number;
  total: number;
}

export function calculateScore(
  basePoints: number,
  hintsUsed: number,
  streak: number
): ScoreResult {
  let points = basePoints;

  const hintPenalty = hintsUsed * 10;
  points = Math.max(points - hintPenalty, basePoints * 0.25);

  let streakBonus = 0;
  if (streak >= 3) {
    streakBonus = Math.round(points * (0.25 * Math.min(streak - 2, 4)));
  }

  return {
    points,
    streakBonus,
    total: points + streakBonus,
  };
}

import { challenges } from "@/lib/challenges";

export const TIER_STARTER_COUNT = 1;
export const TIER_EASY_COUNT = challenges.filter((c) => c.difficulty === "easy" && c.id !== "level-01").length;
export const TIER_MEDIUM_COUNT = challenges.filter((c) => c.difficulty === "medium").length;
export const TIER_HARD_COUNT = challenges.filter((c) => c.difficulty === "hard").length;

export function getTier(
  completedCount: number
): "starter" | "easy" | "medium" | "hard" | "complete" {
  if (completedCount < TIER_STARTER_COUNT) return "starter";
  if (completedCount < TIER_STARTER_COUNT + TIER_EASY_COUNT) return "easy";
  if (completedCount < TIER_STARTER_COUNT + TIER_EASY_COUNT + TIER_MEDIUM_COUNT) return "medium";
  if (completedCount < TIER_STARTER_COUNT + TIER_EASY_COUNT + TIER_MEDIUM_COUNT + TIER_HARD_COUNT) return "hard";
  return "complete";
}

export function isTierUnlocked(
  tier: "starter" | "easy" | "medium" | "hard",
  completedCount: number
): boolean {
  if (tier === "starter") return true;
  if (tier === "easy") return completedCount >= TIER_STARTER_COUNT;
  if (tier === "medium") return completedCount >= TIER_STARTER_COUNT + TIER_EASY_COUNT;
  if (tier === "hard") return completedCount >= TIER_STARTER_COUNT + TIER_EASY_COUNT + TIER_MEDIUM_COUNT;
  return false;
}

export const STARTER_BONUS = 1000;
