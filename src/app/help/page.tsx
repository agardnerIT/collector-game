import Link from "next/link";
import ReactMarkdown from "react-markdown";

const SECTIONS = [
  {
    title: "What is CollectorGame?",
    body: "CollectorGame is a gamified tutorial for the OpenTelemetry Collector. Each challenge presents sample telemetry data and asks you to write a YAML configuration that transforms it — redacting PII, filtering debug noise, extracting structured fields, and more. The app grades your config against the expected output.",
  },
  {
    title: "How Challenges Work",
    body: "Every challenge shows you sample log lines and a code editor pre-filled with a starter YAML config. You edit the config, hit \"Validate Configuration\", and the app checks your config against the expected solution. If correct, you earn points and build your streak.",
  },
  {
    title: "Validation",
    body: "When you submit a config, the app parses your YAML and checks it against the expected structure — processors, receivers, exporters, extensions, connectors, and pipeline wiring. If a collector binary is available locally, it also runs your config against a real OpenTelemetry Collector to compare output bodies.",
  },
  {
    title: "Difficulty Tiers",
    body: "Challenges are grouped into four tiers: **Starter** (1), **Easy** (30), **Medium** (55), and **Hard** (21). Difficulty is determined by a rubric across four dimensions: number of concepts required, OTTL complexity, number of config sections, and number of steps in the solution.\n\n- **Starter:** Onboarding — delete a single attribute (always unlocked)\n- **Easy:** Single-action processors, basic metric receivers, simple OTTL\n- **Medium:** Multi-field configs, metric processing, exporter setup, conditional OTTL\n- **Hard:** Multi-step pipelines, domain-specific configs, advanced OTTL",
  },
  {
    title: "Tier Unlocks",
    body: "Progression is tier-based. The Starter challenge is always unlocked. Complete the **Starter** to unlock Easy. Complete **all 30 Easy** challenges to unlock Medium. Complete **all 55 Medium** to unlock Hard.",
  },
  {
    title: "Scoring",
    body: "Each challenge has a base point value based on its difficulty tier:\n- Starter: 100 points (+ **1,000 bonus** on first completion!)\n- Easy: 100–150 points\n- Medium: 200–250 points\n- Hard: 300–500 points\n\nUsing a hint costs 10 points (floor at 25% of base). Answer correctly and you build a streak — after 3 consecutive correct answers you earn a 25% bonus, increasing up to 100% at 6+. Wrong answers reset your streak to zero.",
  },
  {
    title: "Player Level",
    body: "Your player level equals the number of challenges you've completed. Starting at Level 0, you gain one level per challenge solved. This is a simple measure of your progress through the game.",
  },
  {
    title: "Achievements",
    body: "Earn achievements for hitting milestones:\n- 🌱 **First Steps** — Complete your first challenge\n- 🟢 **Easy Street** — Complete all Easy challenges\n- 🟡 **Getting Serious** — Complete all Medium challenges\n- 🔴 **Hardcore** — Complete all Hard challenges\n- 🔥 **Streak Master** — Reach a streak of 10\n- 💯 **Centurion** — Earn 1,000 total points\n- 🏆 **Completionist** — Complete all 74 challenges",
  },
  {
    title: "Hints",
    body: "Each challenge has progressive hints. Revealing a hint costs 10 points from your total score. Hints mention the processor to use, the OTTL function, or the specific syntax needed.",
  },
  {
    title: "Sound",
    body: "Sound effects are synthesized in-browser using the Web Audio API. Toggle sound on/off using the speaker button in the score bar.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 py-12">
        <Link
          href="/"
          className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1 mb-8"
        >
          ← Back
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent">
            How It Works
          </span>
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-10">
          Everything you need to know about CollectorGame
        </p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-extrabold text-gray-700 dark:text-gray-200 mb-2">
                {section.title}
              </h2>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p>,
                  code: ({ children }) => <code className="bg-candy-orange/20 px-1 rounded text-sm">{children}</code>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-candy-orange/50 hover:decoration-candy-orange text-candy-purple font-bold">
                      {children}
                    </a>
                  ),
                }}
              >
                {section.body}
              </ReactMarkdown>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/levels"
            className="inline-block bg-gradient-to-r from-candy-pink to-candy-orange text-white font-extrabold text-base px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            Start Playing
          </Link>
        </div>
      </div>
    </div>
  );
}
