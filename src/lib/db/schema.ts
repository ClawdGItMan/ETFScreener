import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const etfs = pgTable(
  "etfs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    ticker: text("ticker").notNull().unique(),
    name: text("name").notNull(),
    issuer: text("issuer").notNull(),
    category: text("category"),
    assetClass: text("asset_class"),
    expenseRatio: numeric("expense_ratio", { precision: 6, scale: 4 }),
    aum: numeric("aum", { precision: 18, scale: 2 }),
    avgVolume: numeric("avg_volume", { precision: 18, scale: 0 }),
    price: numeric("price", { precision: 12, scale: 4 }),
    priceChange1d: numeric("price_change_1d", { precision: 8, scale: 4 }),
    priceChange1w: numeric("price_change_1w", { precision: 8, scale: 4 }),
    priceChange1m: numeric("price_change_1m", { precision: 8, scale: 4 }),
    priceChange3m: numeric("price_change_3m", { precision: 8, scale: 4 }),
    priceChangeYtd: numeric("price_change_ytd", { precision: 8, scale: 4 }),
    priceChange1y: numeric("price_change_1y", { precision: 8, scale: 4 }),
    dividendYield: numeric("dividend_yield", { precision: 8, scale: 4 }),
    inceptionDate: text("inception_date"),
    exchange: text("exchange"),
    holdingsCount: integer("holdings_count"),
    indexTracked: text("index_tracked"),
    isBlackrock: boolean("is_blackrock").default(false),
    isharesProductId: text("ishares_product_id"),
    description: text("description"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_etfs_issuer").on(table.issuer),
    index("idx_etfs_category").on(table.category),
    index("idx_etfs_asset_class").on(table.assetClass),
    index("idx_etfs_is_blackrock").on(table.isBlackrock),
    index("idx_etfs_aum").on(table.aum),
  ]
);

export const holdings = pgTable(
  "holdings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    etfTicker: text("etf_ticker")
      .notNull()
      .references(() => etfs.ticker, { onDelete: "cascade" }),
    securityTicker: text("security_ticker"),
    securityName: text("security_name").notNull(),
    sector: text("sector"),
    assetClass: text("asset_class"),
    weight: numeric("weight", { precision: 10, scale: 6 }),
    shares: numeric("shares", { precision: 18, scale: 4 }),
    marketValue: numeric("market_value", { precision: 18, scale: 2 }),
    price: numeric("price", { precision: 12, scale: 4 }),
    location: text("location"),
    exchange: text("exchange"),
    currency: text("currency"),
    asOfDate: text("as_of_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_holdings_etf_ticker").on(table.etfTicker),
    index("idx_holdings_security_ticker").on(table.securityTicker),
    index("idx_holdings_as_of_date").on(table.asOfDate),
    index("idx_holdings_etf_date").on(table.etfTicker, table.asOfDate),
  ]
);

export const holdingsSnapshots = pgTable(
  "holdings_snapshots",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    etfTicker: text("etf_ticker")
      .notNull()
      .references(() => etfs.ticker, { onDelete: "cascade" }),
    snapshotDate: text("snapshot_date").notNull(),
    holdingsData: text("holdings_data").notNull(),
    holdingsCount: integer("holdings_count"),
    topHoldings: text("top_holdings"),
    totalMarketValue: numeric("total_market_value", {
      precision: 18,
      scale: 2,
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_snapshots_etf_date").on(
      table.etfTicker,
      table.snapshotDate
    ),
    index("idx_snapshots_date").on(table.snapshotDate),
  ]
);

export const prices = pgTable(
  "prices",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    ticker: text("ticker").notNull(),
    date: text("date").notNull(),
    open: numeric("open", { precision: 12, scale: 4 }),
    high: numeric("high", { precision: 12, scale: 4 }),
    low: numeric("low", { precision: 12, scale: 4 }),
    close: numeric("close", { precision: 12, scale: 4 }).notNull(),
    adjClose: numeric("adj_close", { precision: 12, scale: 4 }),
    volume: numeric("volume", { precision: 18, scale: 0 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_prices_ticker_date").on(table.ticker, table.date),
    index("idx_prices_ticker").on(table.ticker),
    index("idx_prices_date").on(table.date),
  ]
);

export const newsArticles = pgTable(
  "news_articles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    externalId: text("external_id").unique(),
    title: text("title").notNull(),
    description: text("description"),
    snippet: text("snippet"),
    url: text("url").notNull(),
    imageUrl: text("image_url"),
    source: text("source"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    sentiment: numeric("sentiment", { precision: 5, scale: 4 }),
    sentimentLabel: text("sentiment_label"),
    relevanceScore: numeric("relevance_score", { precision: 5, scale: 4 }),
    apiSource: text("api_source"), // 'marketaux' | 'finnhub' | 'fmp'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_news_published").on(table.publishedAt),
    index("idx_news_sentiment").on(table.sentimentLabel),
  ]
);

export const newsEtfLinks = pgTable(
  "news_etf_links",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    articleId: integer("article_id")
      .notNull()
      .references(() => newsArticles.id, { onDelete: "cascade" }),
    etfTicker: text("etf_ticker")
      .notNull()
      .references(() => etfs.ticker, { onDelete: "cascade" }),
    relevance: numeric("relevance", { precision: 5, scale: 4 }),
  },
  (table) => [
    uniqueIndex("idx_news_etf_unique").on(table.articleId, table.etfTicker),
    index("idx_news_etf_ticker").on(table.etfTicker),
  ]
);

export const sectorWeightings = pgTable(
  "sector_weightings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    etfTicker: text("etf_ticker")
      .notNull()
      .references(() => etfs.ticker, { onDelete: "cascade" }),
    sector: text("sector").notNull(),
    weight: numeric("weight", { precision: 8, scale: 4 }),
    asOfDate: text("as_of_date").notNull(),
  },
  (table) => [
    index("idx_sector_etf").on(table.etfTicker),
    uniqueIndex("idx_sector_unique").on(
      table.etfTicker,
      table.sector,
      table.asOfDate
    ),
  ]
);

export const countryWeightings = pgTable(
  "country_weightings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    etfTicker: text("etf_ticker")
      .notNull()
      .references(() => etfs.ticker, { onDelete: "cascade" }),
    country: text("country").notNull(),
    weight: numeric("weight", { precision: 8, scale: 4 }),
    asOfDate: text("as_of_date").notNull(),
  },
  (table) => [index("idx_country_etf").on(table.etfTicker)]
);

export const etfComparisons = pgTable("etf_comparisons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupName: text("group_name").notNull(),
  groupSlug: text("group_slug").notNull().unique(),
  category: text("category"),
  indexTracked: text("index_tracked"),
  tickers: text("tickers").notNull(), // JSON array
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sessionId: text("session_id").notNull(),
    etfTicker: text("etf_ticker")
      .notNull()
      .references(() => etfs.ticker, { onDelete: "cascade" }),
    notes: text("notes"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_watchlist_unique").on(table.sessionId, table.etfTicker),
  ]
);
