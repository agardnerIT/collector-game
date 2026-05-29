"use client";

import { motion } from "framer-motion";

interface TelemetryViewerProps {
  logs: string[];
  title?: string;
  variant?: "input" | "output";
}

const COLORS = [
  "text-candy-pink",
  "text-candy-purple",
  "text-candy-blue",
  "text-candy-orange",
  "text-candy-mint",
];

export default function TelemetryViewer({
  logs,
  title = "Telemetry",
  variant = "input",
}: TelemetryViewerProps) {
  return (
    <div className="game-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{variant === "input" ? "📥" : "📤"}</span>
        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">{title}</h3>
      </div>
      <div className="bg-gray-50 dark:bg-[var(--bg-code)] rounded-2xl p-3 font-mono text-xs leading-relaxed overflow-x-auto max-h-64 overflow-y-auto">
        {logs.map((log, i) => {
          let parsed;
          try {
            parsed = JSON.parse(log);
          } catch {
            parsed = { body: log };
          }

          return (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${COLORS[i % COLORS.length]}`}
            >
              <span className="text-gray-400 dark:text-gray-500 select-none">{i + 1}. </span>
              {parsed.body ? (
                <>
                  <span className="text-gray-800 dark:text-gray-200">{parsed.body}</span>
                  {parsed.attributes && (
                    <span className="text-gray-400 dark:text-gray-500 ml-2">
                      {Object.entries(parsed.attributes)
                        .map(([k, v]) => {
                          const label = `${k}: ${v}`;
                          // Highlight emails
                          if (
                            typeof v === "string" &&
                            v.includes("@")
                          ) {
                            return (
                              <span
                                key={k}
                                className="bg-candy-pink/20 text-candy-pink px-1 rounded"
                              >
                                {k}: {v}
                              </span>
                            );
                          }
                          return label;
                        })
                        .map((el, j) => (
                          <span key={j} className="mr-1 text-xs">
                            {"{"} {el} {"}"}{" "}
                          </span>
                        ))}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{log}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
