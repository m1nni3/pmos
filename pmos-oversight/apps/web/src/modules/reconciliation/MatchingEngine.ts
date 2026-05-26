export interface MatchCandidate {
  sourceId: string;
  targetId: string;
  amount: number;
  confidence: number;
}

export function findMatches(
  source: { id: string; amount: number; date: string }[],
  target: { id: string; amount: number; date: string }[],
): MatchCandidate[] {
  const matches: MatchCandidate[] = [];

  for (const src of source) {
    const candidates = target
      .filter((tgt) => Math.abs(tgt.amount - src.amount) <= 0.01)
      .map((tgt) => ({
        sourceId: src.id,
        targetId: tgt.id,
        amount: src.amount,
        confidence: 1.0,
      }));

    matches.push(...candidates);
  }

  return matches;
}
