import { challenges, getChallenge, getNextChallenge } from "@/lib/challenges";
import ChallengeClient from "./ChallengeClient";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallenge(id);
  const nextChallenge = getNextChallenge(id);
  const challengeIndex = challenges.findIndex((c) => c.id === id);

  return (
    <ChallengeClient
      challenge={challenge}
      nextChallenge={nextChallenge}
      challengeIndex={challengeIndex}
    />
  );
}
