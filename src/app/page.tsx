"use client";

import LevelMap from "@/components/LevelMap";
import ScoreBar from "@/components/ScoreBar";
import { challenges } from "@/lib/challenges";
import { motion } from "framer-motion";
import Link from "next/link";

const FLOATING_SHAPES = [
  { symbol: "🔴", delay: 0, x: "10%", size: "text-3xl" },
  { symbol: "🟡", delay: 2, x: "85%", size: "text-2xl" },
  { symbol: "🟣", delay: 4, x: "20%", size: "text-4xl" },
  { symbol: "🟢", delay: 1, x: "75%", size: "text-xl" },
  { symbol: "🔵", delay: 3, x: "50%", size: "text-3xl" },
  { symbol: "🧩", delay: 5, x: "90%", size: "text-2xl" },
  { symbol: "💎", delay: 1.5, x: "15%", size: "text-2xl" },
  { symbol: "⭐", delay: 3.5, x: "70%", size: "text-xl" },
  { symbol: "🔶", delay: 5.5, x: "40%", size: "text-3xl" },
  { symbol: "🟦", delay: 2.5, x: "60%", size: "text-2xl" },
];

function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {FLOATING_SHAPES.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute top-0 ${shape.size}`}
          style={{ left: shape.x }}
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 0.15, 0.15, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 15 + i * 3,
            delay: shape.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {shape.symbol}
        </motion.div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-dvh flex flex-col">
      <FloatingShapes />
      <ScoreBar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20 relative z-10">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent">
              CollectorGame
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-semibold max-w-sm mx-auto">
            Master the OpenTelemetry Collector. <br />
            Solve challenges. Write real configs.
          </p>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md text-center leading-relaxed mb-6"
        >
          CollectorGame teaches you the OpenTelemetry Collector through hands-on
          challenges. You write real YAML configs — redacting PII, filtering
          noise, transforming telemetry — and the app validates them against a
          live collector. Each correct answer earns points, unlocks harder
          challenges, and builds your OTEL skills.{" "}
          <Link href="/help" className="text-candy-purple font-bold underline decoration-candy-purple/30 hover:decoration-candy-purple">
            Learn more →
          </Link>
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/levels"
            className="inline-block bg-gradient-to-r from-candy-pink to-candy-orange text-white font-extrabold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow pulse-glow"
          >
            Let&apos;s Go!
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex gap-4 text-sm font-semibold text-gray-400 dark:text-gray-500"
        >
          <span>{challenges.length} Challenges</span>
        </motion.div>
      </main>
    </div>
  );
}
