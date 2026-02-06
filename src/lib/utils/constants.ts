export const ETF_CATEGORIES = [
  "All",
  "Equity",
  "Fixed Income",
  "Commodity",
  "Multi-Asset",
  "Thematic",
  "Currency",
  "Alternative",
] as const;

export const ISSUERS = [
  "BlackRock",
  "Vanguard",
  "State Street",
  "Invesco",
  "Schwab",
  "JPMorgan",
  "Fidelity",
  "WisdomTree",
  "VanEck",
  "ProShares",
  "First Trust",
  "ARK",
] as const;

export const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  Healthcare: "#10b981",
  "Financial Services": "#f59e0b",
  Financials: "#f59e0b",
  "Consumer Cyclical": "#ef4444",
  "Consumer Defensive": "#8b5cf6",
  "Communication Services": "#06b6d4",
  Industrials: "#64748b",
  Energy: "#f97316",
  "Real Estate": "#14b8a6",
  Utilities: "#a3e635",
  "Basic Materials": "#d97706",
  Materials: "#d97706",
  Other: "#94a3b8",
};

export const HEAT_LEVEL_COLORS = {
  hot: "#ef4444",
  warm: "#f59e0b",
  neutral: "#94a3b8",
  cool: "#3b82f6",
  cold: "#6366f1",
} as const;

export const CHART_PERIODS = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "YTD", value: "ytd" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
] as const;

export const COMPARISON_GROUPS = [
  {
    groupName: "S&P 500 Trackers",
    groupSlug: "sp500-trackers",
    category: "Large Cap Blend",
    indexTracked: "S&P 500",
    tickers: ["IVV", "VOO", "SPY", "SPLG"],
  },
  {
    groupName: "Total US Market",
    groupSlug: "total-us-market",
    category: "Large Cap Blend",
    indexTracked: "Total US Market",
    tickers: ["ITOT", "VTI", "SPTM"],
  },
  {
    groupName: "Nasdaq 100",
    groupSlug: "nasdaq-100",
    category: "Large Cap Growth",
    indexTracked: "NASDAQ 100",
    tickers: ["QQQ", "QQQM"],
  },
  {
    groupName: "International Developed",
    groupSlug: "intl-developed",
    category: "International Developed",
    indexTracked: "MSCI EAFE",
    tickers: ["IEFA", "VEA", "EFA", "SPDW"],
  },
  {
    groupName: "Emerging Markets",
    groupSlug: "emerging-markets",
    category: "Emerging Markets",
    indexTracked: "MSCI Emerging Markets",
    tickers: ["IEMG", "VWO", "EEM", "SPEM"],
  },
  {
    groupName: "US Aggregate Bond",
    groupSlug: "us-agg-bond",
    category: "Intermediate-Term Bond",
    indexTracked: "Bloomberg US Aggregate",
    tickers: ["AGG", "BND", "SCHZ"],
  },
  {
    groupName: "Total International Bond",
    groupSlug: "intl-bond",
    category: "International Bond",
    indexTracked: "Bloomberg Global Aggregate ex-USD",
    tickers: ["IAGG", "BNDX"],
  },
  {
    groupName: "Small Cap US",
    groupSlug: "small-cap-us",
    category: "Small Cap Blend",
    indexTracked: "Russell 2000",
    tickers: ["IWM", "VB", "SCHA"],
  },
] as const;
