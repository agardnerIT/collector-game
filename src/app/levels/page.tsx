import LevelMap from "@/components/LevelMap";
import ScoreBar from "@/components/ScoreBar";

export default function LevelsPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <ScoreBar />
      <main className="flex-1 flex items-start justify-center p-4 pt-28 relative z-10">
        <LevelMap />
      </main>
    </div>
  );
}
