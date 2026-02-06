export interface ETF {
  id: number;
  ticker: string;
  name: string;
  issuer: string;
  category: string | null;
  assetClass: string | null;
  expenseRatio: number | null;
  aum: number | null;
  avgVolume: number | null;
  price: number | null;
  priceChange1d: number | null;
  priceChange1w: number | null;
  priceChange1m: number | null;
  priceChange3m: number | null;
  priceChangeYtd: number | null;
  priceChange1y: number | null;
  dividendYield: number | null;
  inceptionDate: string | null;
  exchange: string | null;
  holdingsCount: number | null;
  indexTracked: string | null;
  isBlackrock: boolean;
  description: string | null;
  lastSyncedAt: Date | null;
}

export interface Holding {
  id: number;
  etfTicker: string;
  securityTicker: string | null;
  securityName: string;
  sector: string | null;
  assetClass: string | null;
  weight: number | null;
  shares: number | null;
  marketValue: number | null;
  price: number | null;
  location: string | null;
  exchange: string | null;
  currency: string | null;
  asOfDate: string;
}

export interface PricePoint {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  adjClose: number | null;
  volume: number | null;
}

export interface NewsArticle {
  id: number;
  externalId: string | null;
  title: string;
  description: string | null;
  snippet: string | null;
  url: string;
  imageUrl: string | null;
  source: string | null;
  publishedAt: Date;
  sentiment: number | null;
  sentimentLabel: string | null;
  relevanceScore: number | null;
  relatedTickers?: string[];
}

export interface SectorWeighting {
  sector: string;
  weight: number;
}

export interface CountryWeighting {
  country: string;
  weight: number;
}

export interface HoldingsSnapshot {
  snapshotDate: string;
  holdingsCount: number | null;
  totalMarketValue: number | null;
}

export interface HoldingChange {
  securityTicker: string | null;
  securityName: string;
  weight: number | null;
  type: "added" | "removed";
}

export interface WeightChange {
  securityTicker: string | null;
  securityName: string;
  oldWeight: number;
  newWeight: number;
  delta: number;
}

export interface ComparisonGroup {
  groupName: string;
  groupSlug: string;
  category: string | null;
  indexTracked: string | null;
  tickers: string[];
}

export interface MomentumScore {
  ticker: string;
  name: string;
  score: number;
  heatLevel: "hot" | "warm" | "neutral" | "cool" | "cold";
  return1w: number | null;
  return1m: number | null;
  volumeRatio: number | null;
  price: number | null;
  priceChange1d: number | null;
}

export interface OverlapResult {
  pair: [string, string];
  sharedCount: number;
  uniqueA: number;
  uniqueB: number;
  overlapPct: number;
  sharedHoldings: string[];
}

export interface PortfolioAllocation {
  ticker: string;
  name: string;
  weight: number;
  expenseRatio: number | null;
  dividendYield: number | null;
}
