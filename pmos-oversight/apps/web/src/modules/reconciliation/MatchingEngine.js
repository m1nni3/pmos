export function findMatches(source, target) {
    const matches = [];
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
