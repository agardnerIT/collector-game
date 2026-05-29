"use client";

import LevelTile from "./LevelTile";
import { motion } from "framer-motion";
import { Challenge } from "@/lib/challenges/types";
import { useGameState } from "@/hooks/useGameState";
import { challenges, challengesByDifficulty } from "@/lib/challenges";
import {
  TIER_EASY_COUNT,
  TIER_MEDIUM_COUNT,
  TIER_HARD_COUNT,
  isTierUnlocked,
} from "@/lib/scoring";

function TierSection({
  tier,
  label,
  color,
  bgColor,
  borderColor,
  total,
  challenges,
  icon,
  subtitle,
}: {
  tier: "starter" | "easy" | "medium" | "hard";
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  total: number;
  challenges: Challenge[];
  icon?: string;
  subtitle?: string;
}) {
  const { completedCount, isLevelCompleted } = useGameState();
  const done = challenges.filter((c) => isLevelCompleted(c.id)).length;
  const unlocked = isTierUnlocked(tier, completedCount());

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`w-full rounded-2xl border-2 ${borderColor} ${bgColor} p-4 sm:p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-extrabold ${color}`}>
            {icon ? `${icon} ` : ""}{label}
          </h3>
          {!unlocked && <span className="text-sm text-gray-400">🔒</span>}
        </div>
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
          {done} / {total}
        </span>
      </div>

      {subtitle && unlocked && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 -mt-2">{subtitle}</p>
      )}

      {!unlocked ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
          <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 118 0v4" />
          </svg>
          <p className="text-sm font-bold">
            {tier === "easy" ? "Complete the Starter challenge first" :
             tier === "medium" ? "Complete all Easy challenges first" :
             "Complete all Medium challenges first"}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          {challenges.map((challenge, i) => (
            <LevelTile key={challenge.id} challenge={challenge} tierIndex={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function LevelMap() {
  const starterChallenge = challenges.filter((c) => c.id === "level-01");
  const easyChallenges = challengesByDifficulty("easy").filter((c) => c.id !== "level-01");
  const mediumChallenges = challengesByDifficulty("medium");
  const hardChallenges = challengesByDifficulty("hard");

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <div className="text-center">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-extrabold text-gray-700 dark:text-gray-200 mb-2"
        >
          Select a Challenge
        </motion.h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Complete tiers to unlock the next
        </p>
      </div>

      <TierSection
        tier="starter"
        label="Welcome"
        color="text-candy-purple"
        bgColor="bg-purple-50 dark:bg-purple-900/20"
        borderColor="border-candy-purple/40 dark:border-candy-purple/30"
        total={1}
        challenges={starterChallenge}
        icon="🚀"
        subtitle="Your first challenge — big rewards await!"
      />

      <TierSection
        tier="easy"
        label="Easy"
        color="text-green-600"
        bgColor="bg-green-50 dark:bg-green-900/20"
        borderColor="border-green-200 dark:border-green-800"
        total={TIER_EASY_COUNT}
        challenges={easyChallenges}
      />

      <TierSection
        tier="medium"
        label="Medium"
        color="text-yellow-600"
        bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        borderColor="border-yellow-200 dark:border-yellow-800"
        total={TIER_MEDIUM_COUNT}
        challenges={mediumChallenges}
      />

      <TierSection
        tier="hard"
        label="Hard"
        color="text-red-600"
        bgColor="bg-red-50 dark:bg-red-900/20"
        borderColor="border-red-200 dark:border-red-800"
        total={TIER_HARD_COUNT}
        challenges={hardChallenges}
      />
    </div>
  );
}
