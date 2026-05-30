"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { Challenge } from "@/lib/challenges/types";
import { useGameState } from "@/hooks/useGameState";
import { calculateScore } from "@/lib/scoring";
import ScoreBar from "@/components/ScoreBar";
import TelemetryViewer from "@/components/TelemetryViewer";
import YamlEditor from "@/components/YamlEditor";
import OutputPreview from "@/components/OutputPreview";
import FeedbackOverlay from "@/components/FeedbackOverlay";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { playSound } from "@/lib/sound";

const TUTORIAL_SOLUTION = `processors:
  attributes:
    actions:
      - key: user.email
        action: delete

service:
  pipelines:
    logs:
      processors: [attributes]`;

export default function ChallengeClient({
  challenge,
  nextChallenge,
  challengeIndex,
}: {
  challenge: Challenge | undefined;
  nextChallenge: Challenge | undefined;
  challengeIndex: number;
}) {
  const router = useRouter();

  const {
    isLevelUnlocked,
    getHintsUsed,
    useHint,
    completeLevel,
    resetLevel,
    streak,
    revealAnswer,
    isAnswerRevealed,
    revealedAnswers,
  } = useGameState();

  const [yaml, setYaml] = useState("");
  const [hintsVisible, setHintsVisible] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    actualOutput: string[];
    expectedOutput: string[];
    error?: string;
    diffs?: string[];
    score: number;
    validationMode?: "collector" | "text";
    validationNote?: string;
    scoreEarned?: number;
    networkError?: boolean;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lockedMessage, setLockedMessage] = useState(false);
  const [tutorial, setTutorial] = useState(0);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const validateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (challenge) {
      setYaml(challenge.starterYaml);
      setHintsVisible(0);
      setTutorial(0);
      window.scrollTo(0, 0);
    }
  }, [challenge?.id]);

  useEffect(() => {
    if (tutorial !== 2 || !challenge) return;
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    let i = 0;
    const solution = TUTORIAL_SOLUTION;
    setYaml("");
    const interval = setInterval(() => {
      i++;
      setYaml(solution.slice(0, i));
      if (i >= solution.length) {
        clearInterval(interval);
        setTimeout(() => {
          (document.activeElement as HTMLElement)?.blur();
          setTutorial(3);
        }, 600);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [tutorial, challenge]);

  useEffect(() => {
    if (challenge && !isLevelUnlocked(challenge.id, challenge.difficulty)) {
      setLockedMessage(true);
      const timer = setTimeout(() => {
        router.replace("/levels");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [challenge, isLevelUnlocked, router]);

  const showHint = useCallback(() => {
    if (!challenge) return;
    const current = getHintsUsed(challenge.id);
    if (current < challenge.hints.length) {
      useHint(challenge.id);
      setHintsVisible((h) => h + 1);
      playSound("click");
    }
  }, [challenge, getHintsUsed, useHint]);

  const handleSubmit = useCallback(async () => {
    if (!challenge || loading) return;

    setLoading(true);
    setResult(null);
    setShowFeedback(false);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configYaml: yaml,
          challengeId: challenge.id,
        }),
      });

      const data = await res.json();
      setResult(data);
      setShowFeedback(true);

      if (tutorial === 3) setTutorial(4);

      if (data.correct) {
        const hintsUsed = getHintsUsed(challenge.id);
        const hasRevealed = revealedAnswers.includes(challenge.id);
        const scoreEarned = hasRevealed ? 0 : calculateScore(challenge.basePoints, hintsUsed, streak).total;
        setResult((prev) => prev ? { ...prev, scoreEarned } : prev);
        completeLevel(challenge.id, hintsUsed, challenge.basePoints);
      } else {
        resetLevel(challenge.id);
      }
    } catch (err) {
      setResult({
        correct: false,
        actualOutput: [],
        expectedOutput: challenge.expectedBodies,
        error: "Could not reach the validation server. Check your connection and try again.",
        score: 0,
        networkError: true,
      });
      setShowFeedback(true);
    } finally {
      setLoading(false);
    }
  }, [challenge, loading, yaml, completeLevel, resetLevel, getHintsUsed, tutorial, revealedAnswers]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSubmit]);

  const handleDismissFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const handleNextLevel = useCallback(() => {
    if (nextChallenge) {
      router.push(`/challenge/${nextChallenge.id}`);
    } else {
      router.push("/levels");
    }
  }, [nextChallenge, router]);

  if (!challenge) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-extrabold text-gray-400">
          Challenge not found
        </p>
        <button
          onClick={() => router.push("/levels")}
          className="px-6 py-2 rounded-full text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          Back to Levels
        </button>
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-dvh flex flex-col pb-8">
      {lockedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm"
        >
          <div className="game-card text-center">
            <p className="text-lg font-extrabold text-gray-700 dark:text-gray-200">Level Locked</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Complete earlier levels to unlock this challenge.
            </p>
          </div>
        </motion.div>
      )}
      <ScoreBar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-20 space-y-4 relative z-10">
        <motion.button
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => router.push("/levels")}
          className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
        >
          ← Levels
        </motion.button>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="game-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficultyColors[challenge.difficulty]}`}
            >
              {challenge.difficulty}
            </span>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
              {challenge.category}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-700 dark:text-gray-200">
            Level {challengeIndex + 1}: {challenge.title}
          </h2>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{children}</p>,
              code: ({ children }) => <code className="bg-candy-orange/20 px-1 rounded text-sm">{children}</code>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-candy-orange/50 hover:decoration-candy-orange text-candy-purple font-bold">
                  {children}
                </a>
              ),
            }}
          >
            {challenge.description}
          </ReactMarkdown>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TelemetryViewer
            logs={challenge.inputLogs}
            title="Sample Telemetry (before processing)"
            variant="input"
          />
        </motion.div>

        {challenge.id === "level-01" && tutorial === 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs">
              Not sure what to do? Let us show you how it works.
            </p>
            <button
              onClick={() => setTutorial(1)}
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-candy-purple text-white hover:opacity-90 transition-opacity"
            >
              👀 Show Me
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {(tutorial === 1 || tutorial === 2) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 pb-2"
            >
              <svg width="32" height="40" viewBox="0 0 32 40" className="text-candy-purple">
                <path d="M16 0 L16 30 M5 18 L16 30 L27 18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="bg-candy-purple text-white text-sm font-bold px-4 py-2 rounded-full text-center max-w-xs">
                {tutorial === 1
                  ? "This is the YAML editor. Write your Collector config here!"
                  : "Watch as the correct answer is typed in..."}
              </div>
              {tutorial === 1 && (
                <button
                  onClick={() => setTutorial(2)}
                  className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:opacity-80 transition-opacity"
                >
                  Show Me How →
                </button>
              )}
            </motion.div>
          )}
          <div ref={editorRef}>
            <YamlEditor value={yaml} onChange={(v) => setYaml(v || "")} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          {tutorial === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="bg-candy-orange text-white text-sm font-bold px-4 py-2 rounded-full text-center max-w-xs">
                Now click "Validate Configuration" to check your answer!
              </div>
              <svg width="32" height="40" viewBox="0 0 32 40" className="text-candy-orange -scale-y-100">
                <path d="M16 0 L16 30 M5 18 L16 30 L27 18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          )}
          <div ref={validateRef}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-candy-pink to-candy-orange text-white font-extrabold text-lg py-4 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validating...
                </span>
              ) : (
                "Validate Configuration"
              )}
            </button>
          </div>

          <div className="text-center">
            {hintsVisible > 0 && (
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">
                Hint {hintsVisible} of {challenge.hints.length}
              </p>
            )}
            <AnimatePresence>
              {hintsVisible > 0 &&
                challenge.hints.slice(0, hintsVisible).map((hint, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="bg-candy-yellow/10 text-candy-orange text-sm py-1.5 px-3 rounded-full mb-1 [&_code]:bg-candy-orange/20 [&_code]:px-1 [&_code]:rounded"
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <span>{children}</span>,
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-candy-orange/50 hover:decoration-candy-orange text-candy-purple font-bold"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {hint}
                    </ReactMarkdown>
                  </motion.div>
                ))}
            </AnimatePresence>
            {hintsVisible < challenge.hints.length && (
              <button
                onClick={showHint}
                className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-candy-purple transition-colors mt-1"
              >
                Show hint <span className="text-candy-pink">(-10 pts)</span>
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              {showRevealConfirm ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col items-center gap-2"
                >
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-xs">
                    This will fill in the correct answer and mark the challenge as completed. You'll earn <span className="text-candy-pink font-bold">0 points</span>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!challenge?.solutionYaml) return;
                        setYaml(challenge.solutionYaml);
                        revealAnswer(challenge.id);
                        setShowRevealConfirm(false);
                        playSound("click");
                      }}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-candy-pink/10 text-candy-pink hover:bg-candy-pink/20 transition-colors"
                    >
                      Yes, Show Answer
                    </button>
                    <button
                      onClick={() => setShowRevealConfirm(false)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                !isAnswerRevealed(challenge.id) && (
                  <button
                    onClick={() => setShowRevealConfirm(true)}
                    className="text-xs font-bold text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 transition-colors"
                  >
                    Show Answer (0 pts)
                  </button>
                )
              )}
              {isAnswerRevealed(challenge.id) && (
                <p className="text-xs text-gray-300 dark:text-gray-600 text-center">
                  Answer revealed. Validate to complete (0 pts).
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {result?.error && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="game-card border-candy-pink bg-candy-pink/5"
          >
            <p className="text-sm text-candy-pink font-semibold">
              {result.error}
            </p>
            {result.diffs && result.diffs.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.diffs.map((diff, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-white/50 dark:bg-black/20 rounded px-2 py-1"
                  >
                    {diff}
                  </li>
                ))}
              </ul>
            )}
            {result.validationMode === "text" && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Validated via config comparison (collector binary not available)
              </p>
            )}
            {result.networkError && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-candy-pink/10 text-candy-pink hover:bg-candy-pink/20 transition-colors"
              >
                Retry
              </button>
            )}
          </motion.div>
        )}

        {result && !result.error && (
          <OutputPreview
            logs={result.actualOutput}
            expectedLogs={result.expectedOutput}
            showResult={true}
          />
        )}

        {tutorial === 4 && result?.correct && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="game-card border-candy-mint text-center"
          >
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-extrabold text-candy-mint mb-1">You did it!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              That's how every challenge works. Write your YAML config, hit validate,
              and earn points. Now try the next challenge on your own!
            </p>
          </motion.div>
        )}

        <div className="h-4" />
      </main>

      <FeedbackOverlay
        show={showFeedback && result !== null}
        type={result?.correct ? "correct" : "wrong"}
        scoreEarned={result?.correct ? result.scoreEarned : undefined}
        onDismiss={handleDismissFeedback}
        onNextLevel={handleNextLevel}
        hasNextLevel={!!nextChallenge && result?.correct}
      />
    </div>
  );
}
