"use client";

import { motion } from "framer-motion";

interface OutputPreviewProps {
  logs: string[];
  expectedLogs: string[];
  showResult: boolean;
}

export default function OutputPreview({
  logs,
  expectedLogs,
  showResult,
}: OutputPreviewProps) {
  if (!showResult) return null;

  const correct = logs.length === expectedLogs.length
    ? logs.every((l, i) => l === expectedLogs[i] || logs.slice().sort().join() === expectedLogs.slice().sort().join())
    : false;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="game-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{correct ? "✅" : "❌"}</span>
        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">
          {correct ? "Output Matches!" : "Output Mismatch"}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">YOUR OUTPUT</p>
          <div className="bg-gray-50 dark:bg-[var(--bg-code)] rounded-xl p-2 font-mono text-xs">
            {logs.map((l, i) => (
              <div key={i} className="py-0.5 text-gray-700 dark:text-gray-200">
                {l}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">EXPECTED</p>
          <div className="bg-green-50 dark:bg-green-950/40 rounded-xl p-2 font-mono text-xs">
            {expectedLogs.map((l, i) => (
              <div key={i} className="py-0.5 text-gray-700 dark:text-gray-200">
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
