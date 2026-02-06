import type { Holding, OverlapResult, MomentumScore } from "@/types/etf";

export function computeMomentumScore(etf: {
  priceChange1w: number | null;
  priceChange1m: number | null;
  avgVolume: number | null;
  // We use a simple proxy for volume momentum
}): number {
  const w1 = etf.priceChange1w ?? 0;
  const m1 = etf.priceChange1m ?? 0;

  // Weighted composite: emphasize recent momentum
  const score = w1 * 0.4 + m1 * 0.6;

  // Normalize to roughly -1 to 1 range (most ETFs move <10% monthly)
  return Math.max(-1, Math.min(1, score / 10));
}

export function getHeatLevel(
  score: number
): "hot" | "warm" | "neutral" | "cool" | "cold" {
  if (score > 0.3) return "hot";
  if (score > 0.1) return "warm";
  if (score > -0.1) return "neutral";
  if (score > -0.3) return "cool";
  return "cold";
}

export function computePairwiseOverlap(
  holdingsMap: Record<string, { securityTicker: string | null }[]>
): OverlapResult[] {
  const tickers = Object.keys(holdingsMap);
  const results: OverlapResult[] = [];

  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      const a = tickers[i];
      const b = tickers[j];

      const setA = new Set(
        holdingsMap[a]
          .map((h) => h.securityTicker)
          .filter((t): t is string => t != null)
      );
      const setB = new Set(
        holdingsMap[b]
          .map((h) => h.securityTicker)
          .filter((t): t is string => t != null)
      );

      const shared = [...setA].filter((t) => setB.has(t));
      const totalUnique = new Set([...setA, ...setB]).size;

      results.push({
        pair: [a, b],
        sharedCount: shared.length,
        uniqueA: setA.size - shared.length,
        uniqueB: setB.size - shared.length,
        overlapPct: totalUnique > 0 ? (shared.length / totalUnique) * 100 : 0,
        sharedHoldings: shared.slice(0, 20), // Top 20 shared
      });
    }
  }

  return results;
}

export function computeCorrelation(
  seriesA: number[],
  seriesB: number[]
): number {
  const n = Math.min(seriesA.length, seriesB.length);
  if (n < 2) return 0;

  const a = seriesA.slice(0, n);
  const b = seriesB.slice(0, n);

  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;

  let cov = 0;
  let varA = 0;
  let varB = 0;

  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }

  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : cov / denom;
}

export function computeExpenseSavings(
  investmentAmount: number,
  years: number,
  erA: number,
  erB: number,
  annualReturn: number = 0.08
): { yearlyData: { year: number; valueA: number; valueB: number; savings: number }[] } {
  const yearlyData = [];

  let valueA = investmentAmount;
  let valueB = investmentAmount;

  for (let year = 1; year <= years; year++) {
    valueA = valueA * (1 + annualReturn - erA);
    valueB = valueB * (1 + annualReturn - erB);

    yearlyData.push({
      year,
      valueA: Math.round(valueA * 100) / 100,
      valueB: Math.round(valueB * 100) / 100,
      savings: Math.round(Math.abs(valueA - valueB) * 100) / 100,
    });
  }

  return { yearlyData };
}

export function normalizeReturns(
  priceData: { date: string; close: number }[]
): { date: string; value: number }[] {
  if (priceData.length === 0) return [];
  const basePrice = priceData[0].close;
  return priceData.map((p) => ({
    date: p.date,
    value: (p.close / basePrice) * 100,
  }));
}
