"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateScore, isTierUnlocked, STARTER_BONUS } from "@/lib/scoring";
import { challenges } from "@/lib/challenges";
import { playSound, setMuted } from "@/lib/sound";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-steps", title: "First Steps", description: "Complete your first challenge", icon: "🌱" },
  { id: "easy-street", title: "Easy Street", description: "Complete all Easy challenges", icon: "🟢" },
  { id: "getting-serious", title: "Getting Serious", description: "Complete all Medium challenges", icon: "🟡" },
  { id: "hardcore", title: "Hardcore", description: "Complete all Hard challenges", icon: "🔴" },
  { id: "streak-master", title: "Streak Master", description: "Reach a streak of 10", icon: "🔥" },
  { id: "centurion", title: "Centurion", description: "Earn 1,000 total points", icon: "💯" },
  { id: "completionist", title: "Completionist", description: "Complete all challenges", icon: "🏆" },
];

interface GameState {
  score: number;
  streak: number;
  completedLevels: string[];
  hintsUsed: Record<string, number>;
  soundEnabled: boolean;
  earnedAchievements: string[];
  starterBonusCollected: boolean;
  revealedAnswers: string[];

  completeLevel: (levelId: string, hintsUsedCount: number, basePoints: number) => void;
  resetLevel: (levelId: string) => void;
  isLevelCompleted: (levelId: string) => boolean;
  isLevelUnlocked: (levelId: string, difficulty: "easy" | "medium" | "hard") => boolean;
  getHintsUsed: (levelId: string) => number;
  useHint: (levelId: string) => void;
  getLevel: () => number;
  toggleSound: () => void;
  resetProgress: () => void;
  completedCount: () => number;
  completedEasyCount: () => number;
  completedMediumCount: () => number;
  completedHardCount: () => number;
  checkAchievements: () => string[];
  revealAnswer: (levelId: string) => void;
  isAnswerRevealed: (levelId: string) => boolean;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      score: 0,
      streak: 0,
      completedLevels: [],
      hintsUsed: {},
      soundEnabled: true,
      earnedAchievements: [],
      starterBonusCollected: false,
      revealedAnswers: [],

      completeLevel: (levelId, hintsUsedCount, basePoints) => {
        const state = get();
        if (state.completedLevels.includes(levelId)) return;

        const isRevealed = state.revealedAnswers.includes(levelId);

        if (isRevealed) {
          set({
            completedLevels: [...state.completedLevels, levelId],
          });
          return;
        }

        const isStarter = levelId === "level-01" && !state.starterBonusCollected;

        const { points, streakBonus, total } = calculateScore(
          basePoints,
          hintsUsedCount,
          state.streak
        );

        const bonusPoints = isStarter ? STARTER_BONUS : 0;

        const newCompleted = [...state.completedLevels, levelId];
        const newStreak = state.streak + 1;

        if (isStarter) {
          playSound("levelup");
        } else if (streakBonus > 0) {
          playSound("combo");
        } else {
          playSound("correct");
        }

        const newState: Partial<GameState> = {
          score: state.score + total + bonusPoints,
          streak: newStreak,
          completedLevels: newCompleted,
        };

        if (isStarter) {
          newState.starterBonusCollected = true;
        }

        set(newState);

        const achievements = get().checkAchievements();
        if (achievements.length > state.earnedAchievements.length) {
          setTimeout(() => playSound("levelup"), 300);
        }
      },

      resetLevel: () => {
        set({ streak: 0 });
        playSound("wrong");
      },

      isLevelCompleted: (levelId) => {
        return get().completedLevels.includes(levelId);
      },

      isLevelUnlocked: (levelId, difficulty) => {
        if (levelId === "level-01") return true;
        return isTierUnlocked(difficulty, get().completedLevels.length);
      },

      getHintsUsed: (levelId) => {
        return get().hintsUsed[levelId] ?? 0;
      },

      useHint: (levelId) => {
        set((state) => ({
          hintsUsed: {
            ...state.hintsUsed,
            [levelId]: (state.hintsUsed[levelId] ?? 0) + 1,
          },
          score: Math.max(0, state.score - 10),
        }));
      },

      revealAnswer: (levelId) => {
        set((state) => ({
          revealedAnswers: [...state.revealedAnswers, levelId],
        }));
      },

      isAnswerRevealed: (levelId) => {
        return get().revealedAnswers.includes(levelId);
      },

      getLevel: () => {
        return get().completedLevels.length;
      },

      toggleSound: () => {
        set((state) => {
          const next = !state.soundEnabled;
          setMuted(!next);
          return { soundEnabled: next };
        });
      },

      resetProgress: () => {
        set({
          score: 0,
          streak: 0,
          completedLevels: [],
          hintsUsed: {},
          earnedAchievements: [],
          starterBonusCollected: false,
          revealedAnswers: [],
        });
      },

      completedCount: () => get().completedLevels.length,

      completedEasyCount: () => {
        const state = get();
        return challenges.filter(
          (c) => c.difficulty === "easy" && c.id !== "level-01" && state.completedLevels.includes(c.id)
        ).length;
      },

      completedMediumCount: () => {
        const state = get();
        return challenges.filter(
          (c) => c.difficulty === "medium" && state.completedLevels.includes(c.id)
        ).length;
      },

      completedHardCount: () => {
        const state = get();
        return challenges.filter(
          (c) => c.difficulty === "hard" && state.completedLevels.includes(c.id)
        ).length;
      },

      checkAchievements: () => {
        const state = get();
        const completed = state.completedLevels;
        const earned = [...state.earnedAchievements];
        const newEarned: string[] = [];

        const totalCount = completed.length;
        const easyTotal = challenges.filter((c) => c.difficulty === "easy" && c.id !== "level-01").length;
        const mediumTotal = challenges.filter((c) => c.difficulty === "medium").length;
        const hardTotal = challenges.filter((c) => c.difficulty === "hard").length;

        const easyDone = challenges.filter(
          (c) => c.difficulty === "easy" && c.id !== "level-01" && completed.includes(c.id)
        ).length;
        const mediumDone = challenges.filter(
          (c) => c.difficulty === "medium" && completed.includes(c.id)
        ).length;
        const hardDone = challenges.filter(
          (c) => c.difficulty === "hard" && completed.includes(c.id)
        ).length;

        if (totalCount >= 1 && !earned.includes("first-steps")) newEarned.push("first-steps");
        if (easyDone >= easyTotal && !earned.includes("easy-street")) newEarned.push("easy-street");
        if (mediumDone >= mediumTotal && !earned.includes("getting-serious")) newEarned.push("getting-serious");
        if (hardDone >= hardTotal && !earned.includes("hardcore")) newEarned.push("hardcore");
        if (state.streak >= 10 && !earned.includes("streak-master")) newEarned.push("streak-master");
        if (state.score >= 1000 && !earned.includes("centurion")) newEarned.push("centurion");
        if (totalCount >= challenges.length && !earned.includes("completionist")) newEarned.push("completionist");

        if (newEarned.length > 0) {
          set({ earnedAchievements: [...earned, ...newEarned] });
        }

        return newEarned;
      },
    }),
    {
      name: "collectorgame-state",
      partialize: (state) =>
        ({
          score: state.score,
          streak: state.streak,
          completedLevels: state.completedLevels,
          hintsUsed: state.hintsUsed,
          soundEnabled: state.soundEnabled,
          earnedAchievements: state.earnedAchievements,
          starterBonusCollected: state.starterBonusCollected,
          revealedAnswers: state.revealedAnswers,
        }) as GameState,
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            setMuted(!state.soundEnabled);
          }
        };
      },
    }
  )
);
