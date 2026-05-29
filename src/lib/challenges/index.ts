import { Challenge } from "./types";
import { challenges as challengeData } from "./data";

export const challenges: Challenge[] = challengeData;

export function getChallenge(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}

export function getNextChallenge(currentId: string): Challenge | undefined {
  const idx = challenges.findIndex((c) => c.id === currentId);
  if (idx === -1 || idx >= challenges.length - 1) return undefined;
  return challenges[idx + 1];
}

export function challengesByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): Challenge[] {
  return challenges.filter((c) => c.difficulty === difficulty);
}

export function challengeCounts(): {
  total: number;
  easy: number;
  medium: number;
  hard: number;
} {
  return {
    total: challenges.length,
    easy: challenges.filter((c) => c.difficulty === "easy").length,
    medium: challenges.filter((c) => c.difficulty === "medium").length,
    hard: challenges.filter((c) => c.difficulty === "hard").length,
  };
}
