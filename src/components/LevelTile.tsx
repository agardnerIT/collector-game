"use client";

import { motion } from "framer-motion";
import { Challenge } from "@/lib/challenges/types";
import { useGameState } from "@/hooks/useGameState";
import Link from "next/link";

interface LevelTileProps {
  challenge: Challenge;
  tierIndex: number;
}

const TILE_COLORS = [
  "bg-candy-pink",
  "bg-candy-orange",
  "bg-candy-yellow",
  "bg-candy-mint",
  "bg-candy-purple",
  "bg-candy-blue",
  "bg-candy-pink",
  "bg-candy-orange",
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function LevelTile({ challenge, tierIndex }: LevelTileProps) {
  const { isLevelCompleted, isLevelUnlocked } = useGameState();
  const completed = isLevelCompleted(challenge.id);
  const unlocked = isLevelUnlocked(challenge.id, challenge.difficulty);
  const color = TILE_COLORS[tierIndex % TILE_COLORS.length];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: unlocked ? 1 : 0.85, rotate: 0 }}
      transition={{ delay: tierIndex * 0.02, type: "spring", stiffness: 300 }}
      whileHover={unlocked ? { scale: 1.08 } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
      className="relative"
      suppressHydrationWarning
    >
      {unlocked ? (
        <Link href={`/challenge/${challenge.id}`}>
          <div
            className={`box-border w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${color} flex flex-col items-center justify-center text-white font-extrabold shadow-lg cursor-pointer
              ${completed ? "sparkle" : ""}
              ${!completed ? "pulse-glow" : ""}
            `}
          >
            <span className="text-2xl sm:text-3xl">{tierIndex + 1}</span>
            <span className="text-[10px] sm:text-xs opacity-80">
              {completed ? (
                <span className="flex gap-0.5">★★★</span>
              ) : (
                challenge.difficulty
              )}
            </span>
          </div>
          <p className="text-center text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-300 mt-1 w-20 sm:w-24 truncate">
            {challenge.title}
          </p>
        </Link>
      ) : (
        <div>
          <div className="box-border w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-300 dark:bg-gray-700 flex flex-col items-center justify-center shadow-inner">
            <svg className="w-7 h-7 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 118 0v4" />
            </svg>
            <span className="text-[10px] sm:text-xs mt-1 font-bold text-gray-500 dark:text-gray-400">
              {tierIndex + 1}
            </span>
          </div>
          <p className="text-center text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 w-20 sm:w-24 truncate">
            {challenge.title}
          </p>
        </div>
      )}

      {unlocked && !completed && (
        <span
          className={`absolute -top-1 -right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[challenge.difficulty]}`}
        >
          {challenge.difficulty}
        </span>
      )}
    </motion.div>
  );
}
