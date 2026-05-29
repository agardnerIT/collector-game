"use client";

import { useGameState, ACHIEVEMENTS } from "@/hooks/useGameState";
import { challenges } from "@/lib/challenges";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";

const TIER_COLORS: Record<string, { bg: string; fill: string; label: string }> = {
  easy: { bg: "#dcfce7", fill: "#22c55e", label: "Easy" },
  medium: { bg: "#fef9c3", fill: "#eab308", label: "Medium" },
  hard: { bg: "#fee2e2", fill: "#ef4444", label: "Hard" },
};

function drawBadge(
  canvas: HTMLCanvasElement,
  data: {
    level: number;
    score: number;
    completed: number;
    total: number;
    easyDone: number;
    easyTotal: number;
    mediumDone: number;
    mediumTotal: number;
    hardDone: number;
    hardTotal: number;
    earned: string[];
    streak: number;
  }
) {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#fdf2f8");
  grad.addColorStop(0.3, "#fff7ed");
  grad.addColorStop(0.6, "#fefce8");
  grad.addColorStop(1, "#f0fdf4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  const r = 24;
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = "rgba(255,107,157,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "center";

  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("CollectorGame", w / 2, 58);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "14px sans-serif";
  ctx.fillText("OpenTelemetry Collector Mastery", w / 2, 82);

  ctx.fillStyle = "#4a3652";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`Level ${data.level}`, w / 2, 120);

  ctx.fillStyle = "#6b7280";
  ctx.font = "13px sans-serif";
  ctx.fillText(`${data.completed} / ${data.total} challenges completed`, w / 2, 144);

  ctx.fillStyle = "#ff6b9d";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`${data.score} pts`, w / 2, 176);

  const tiers = [
    { done: data.easyDone, total: data.easyTotal, key: "easy" },
    { done: data.mediumDone, total: data.mediumTotal, key: "medium" },
    { done: data.hardDone, total: data.hardTotal, key: "hard" },
  ];

  let y = 202;
  for (const t of tiers) {
    const c = TIER_COLORS[t.key];
    ctx.textAlign = "left";
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(c.label, 48, y + 4);

    ctx.fillStyle = c.bg;
    ctx.beginPath();
    ctx.roundRect(120, y - 6, w - 168, 16, 8);
    ctx.fill();

    const pct = t.total > 0 ? t.done / t.total : 0;
    if (pct > 0) {
      ctx.fillStyle = c.fill;
      ctx.beginPath();
      ctx.roundRect(120, y - 6, Math.max((w - 168) * pct, 16), 16, 8);
      ctx.fill();
    }

    ctx.textAlign = "right";
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${t.done}/${t.total}`, w - 48, y + 4);

    y += 32;
  }

  const earned = data.earned;
  const earnedAchievements = ACHIEVEMENTS.filter((a) => earned.includes(a.id));
  if (earnedAchievements.length > 0) {
    ctx.fillStyle = "#4a3652";
    ctx.textAlign = "center";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Achievements", w / 2, y + 18);

    const icons = earnedAchievements.map((a) => a.icon).join("  ");
    ctx.font = "22px sans-serif";
    ctx.fillText(icons, w / 2, y + 50);

    const labels = earnedAchievements.map((a) => a.title).join(" · ");
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px sans-serif";
    ctx.fillText(labels, w / 2, y + 74);
  }

  if (data.streak >= 3) {
    ctx.fillStyle = "#ff8a50";
    ctx.textAlign = "center";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`🔥 ${data.streak}x streak`, w / 2, h - 24);
  }

  ctx.fillStyle = "#d1d5db";
  ctx.textAlign = "center";
  ctx.font = "10px sans-serif";
  ctx.fillText("collectorgame.app", w / 2, h - 8);
}

export default function BadgePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const {
    score,
    streak,
    getLevel,
    completedCount,
    completedEasyCount,
    completedMediumCount,
    completedHardCount,
    earnedAchievements,
  } = useGameState();

  const level = getLevel();
  const total = challenges.length;
  const easyTotal = challenges.filter((c) => c.difficulty === "easy" && c.id !== "level-01").length;
  const mediumTotal = challenges.filter((c) => c.difficulty === "medium").length;
  const hardTotal = challenges.filter((c) => c.difficulty === "hard").length;

  const data = {
    level,
    score,
    completed: completedCount(),
    total,
    easyDone: completedEasyCount(),
    easyTotal,
    mediumDone: completedMediumCount(),
    mediumTotal,
    hardDone: completedHardCount(),
    hardTotal,
    earned: earnedAchievements,
    streak,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawBadge(canvas, data);
    canvas.toBlob((b) => setImageBlob(b), "image/png");
  }, [data]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "collectorgame-badge.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const shareNative = useCallback(async () => {
    if (!imageBlob) return;
    const file = new File([imageBlob], "collectorgame-badge.png", { type: "image/png" });
    try {
      await navigator.share({
        title: "CollectorGame Badge",
        text: shareText,
        files: [file],
      });
    } catch {}
  }, [imageBlob]);

  const shareText = `I completed ${data.completed}/${data.total} challenges (Level ${data.level}) in CollectorGame! ${data.earned.length} achievements earned. Can you beat my score?`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://collectorgame.app")}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://collectorgame.app")}`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center p-4 pt-8">
      <Link
        href="/"
        className="self-start text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1 mb-4"
      >
        ← Home
      </Link>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl shadow-xl overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          width={420}
          height={480}
          className="w-[350px] sm:w-[420px] h-auto"
        />
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 mt-6 max-w-sm">
        <button
          onClick={download}
          className="px-5 py-2.5 rounded-full text-sm font-bold bg-candy-purple text-white hover:opacity-90 transition-opacity"
        >
          ⬇ Download
        </button>

        {typeof navigator.share !== "undefined" && (
          <button
            onClick={shareNative}
            className="px-5 py-2.5 rounded-full text-sm font-bold bg-candy-pink text-white hover:opacity-90 transition-opacity"
          >
            📤 Share
          </button>
        )}

        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-full text-sm font-bold bg-black text-white hover:opacity-90 transition-opacity"
        >
          𝕏 Twitter
        </a>

        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-full text-sm font-bold bg-blue-700 text-white hover:opacity-90 transition-opacity"
        >
          in LinkedIn
        </a>

        <button
          onClick={copyLink}
          className="px-5 py-2.5 rounded-full text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:opacity-90 transition-opacity"
        >
          {copied ? "✓ Copied!" : "📋 Copy"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 max-w-sm"
      >
        <p className="mb-1 font-bold">Share this badge on social media or download it as a PNG.</p>
        <p>Your stats are stored locally — this badge is unique to you.</p>
      </motion.div>
    </div>
  );
}
