"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { playSound } from "@/lib/sound";

interface FeedbackOverlayProps {
  show: boolean;
  type: "correct" | "wrong" | null;
  scoreEarned?: number;
  onDismiss: () => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
}

export default function FeedbackOverlay({
  show,
  type,
  scoreEarned,
  onDismiss,
  onNextLevel,
  hasNextLevel = false,
}: FeedbackOverlayProps) {
  useEffect(() => {
    if (type === "correct") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff6b9d", "#ffd93d", "#67b8f7", "#c084fc", "#5de8a0"],
      });
      playSound("correct");
    } else if (type === "wrong") {
      playSound("wrong");
    }
  }, [type]);

  return (
    <AnimatePresence>
      {show && type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-sm p-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.3, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.3, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`game-card max-w-xs w-full text-center ${type === "correct" ? "border-candy-mint" : "border-candy-pink"} border-3`}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: type === "correct" ? [0, -10, 10, -10, 0] : [0, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
              className="text-5xl mb-3"
            >
              {type === "correct" ? "🎉" : "💥"}
            </motion.div>
            <h2 className={`text-2xl font-extrabold mb-2 ${type === "correct" ? "text-candy-mint" : "text-candy-pink"}`}>
              {type === "correct" ? "Correct!" : "Not quite!"}
            </h2>
            {type === "correct" && scoreEarned !== undefined && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-lg font-bold text-candy-purple mb-4"
              >
                +{scoreEarned} points
              </motion.p>
            )}
            {type === "wrong" && (
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                Check the output vs. expected. Use hints if needed!
              </p>
            )}
            {type === "wrong" && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                Try Again
              </button>
            )}
            {type === "correct" && hasNextLevel && onNextLevel && (
              <button
                onClick={onNextLevel}
                className="px-4 py-2 rounded-full text-sm font-bold bg-candy-mint text-white hover:bg-candy-mint/80"
              >
                Next Level →
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
