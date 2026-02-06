export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ETFFilters {
  sort?: string;
  order?: "asc" | "desc";
  issuer?: string;
  category?: string;
  assetClass?: string;
  search?: string;
  blackrockOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface FMPEtfInfo {
  symbol: string;
  companyName: string;
  etfExpenseRatio: number;
  aum: number;
  avgVolume: number;
  price: number;
  changes: number;
  changesPercentage: number;
  yearReturn: number;
  exchange: string;
  exchangeShortName: string;
  sector: string;
  industry: string;
  description: string;
  ipoDate: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
}

export interface FMPHolding {
  asset: string;
  name: string;
  isin: string;
  cusip: string;
  sharesNumber: number;
  weightPercentage: number;
  marketValue: number;
  updated: string;
}

export interface FMPPriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

export interface FMPSectorWeight {
  sector: string;
  weightPercentage: string;
}

export interface FMPCountryWeight {
  country: string;
  weightPercentage: string;
}

export interface MarketauxArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  source: string;
  published_at: string;
  entities: {
    symbol: string;
    name: string;
    type: string;
    sentiment_score: number;
    highlights: { highlight: string }[];
  }[];
  relevance_score: number;
}
