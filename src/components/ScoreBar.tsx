"use client";

import { useGameState, ACHIEVEMENTS } from "@/hooks/useGameState";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { challenges } from "@/lib/challenges";

export default function ScoreBar() {
  const { score, streak, getLevel, soundEnabled, toggleSound, completedCount, completedEasyCount, completedMediumCount, completedHardCount, earnedAchievements, isLevelCompleted } = useGameState();
  const level = getLevel();
  const [hydrated, setHydrated] = useState(false);
  const [dark, setDark] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("collectorgame-dark", String(next));
    } catch {}
  };

  const easyTotal = challenges.filter(c => c.difficulty === "easy" && c.id !== "level-01").length;
  const medTotal = challenges.filter(c => c.difficulty === "medium").length;
  const hardTotal = challenges.filter(c => c.difficulty === "hard").length;
  const easyPct = easyTotal > 0 ? Math.round((completedEasyCount() / easyTotal) * 100) : 0;
  const medPct = medTotal > 0 ? Math.round((completedMediumCount() / medTotal) * 100) : 0;
  const hardPct = hardTotal > 0 ? Math.round((completedHardCount() / hardTotal) * 100) : 0;

  const starterDone = isLevelCompleted("level-01") ? 1 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-white/80 dark:bg-[var(--bg-scorebar)] backdrop-blur-md border-b-2 border-candy-pink/30 dark:border-candy-pink/20 px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ScoreItem label="LEVEL" value={hydrated ? `${level}` : "1"} color="bg-candy-purple" />
              <ScoreItem
                label="SCORE"
                value={hydrated ? `${score}` : "0"}
                color="bg-candy-pink"
              />
              <ScoreItem
                label="DONE"
                value={hydrated ? `${completedCount()}` : "0"}
                color="bg-candy-mint"
              />
              <AnimatePresence>
                {streak >= 2 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="bg-candy-yellow rounded-full px-2.5 py-0.5 text-xs font-bold text-white flex items-center gap-1"
                  >
                    {streak}x
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/badge"
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                title="Shareable Badge"
              >
                🏆
              </Link>
              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                title="Achievements"
              >
                🏅
              </button>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
              <button
                onClick={toggleDark}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700"
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? "☀️" : "🌙"}
                <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
              </button>
              <button
                onClick={toggleSound}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                  soundEnabled
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                    : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
                }`}
                title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
              >
                {soundEnabled ? "🔊" : "🔇"}
                <span className="hidden sm:inline">{soundEnabled ? "Sound" : "Muted"}</span>
              </button>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-candy-purple w-8">Start</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-candy-purple rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: starterDone ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-400 w-8 text-right">{hydrated ? starterDone : 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-green-600 w-8">Easy</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${easyPct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-400 w-8 text-right">{hydrated ? completedEasyCount() : 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-yellow-600 w-8">Med</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${medPct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-400 w-8 text-right">{hydrated ? completedMediumCount() : 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-red-600 w-8">Hard</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${hardPct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-400 w-8 text-right">{hydrated ? completedHardCount() : 0}</span>
              </div>
            </div>
          </div>

          {streak >= 3 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-bold text-candy-orange mt-0.5 text-right"
            >
              {Math.round(25 * Math.min(streak - 2, 4))}% streak bonus active
            </motion.p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/95 dark:bg-[#1a1a2e]/95 backdrop-blur-md border-b-2 border-candy-purple/20 px-4 py-4"
          >
            <div className="max-w-2xl mx-auto">
              <h4 className="text-sm font-extrabold text-gray-600 dark:text-gray-300 mb-3">Achievements</h4>
              <div className="flex flex-wrap gap-3">
                {ACHIEVEMENTS.map((a) => {
                  const earned = earnedAchievements.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        earned
                          ? "bg-candy-yellow/20 text-yellow-700 dark:text-yellow-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                      }`}
                      title={a.description}
                    >
                      <span>{earned ? a.icon : "🔒"}</span>
                      {a.title}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-1.5"
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider">
        {label}
      </span>
      <span
        className={`${color} text-white text-xs font-extrabold rounded-full px-2.5 py-0.5 min-w-[40px] text-center`}
      >
        {value}
      </span>
    </motion.div>
  );
}
