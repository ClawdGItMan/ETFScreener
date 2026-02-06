import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getEtfByTicker } from "@/lib/db/queries/etfs";
import { getTopHoldings } from "@/lib/db/queries/holdings";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceChange, LargeNumber } from "@/components/shared/number-format";
import { HoldingsTable } from "@/components/holdings/holdings-table";
import { FullHoldingsTable } from "@/components/holdings/full-holdings-table";
import { SectorPieChart } from "@/components/holdings/sector-pie-chart";
import { EtfPriceChartWrapper } from "./price-chart-wrapper";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface EtfDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function EtfDetailPage({ params }: EtfDetailPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  let etf;
  let topHoldings: Awaited<ReturnType<typeof getTopHoldings>> = [];

  try {
    etf = await getEtfByTicker(upperTicker);
    if (etf) {
      topHoldings = await getTopHoldings(upperTicker, 25);
    }
  } catch {
    // DB not connected
  }

  // Demo mode if no DB
  if (!etf) {
    return (
      <div className="space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="text-center py-16 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">ETF Not Found</h2>
          <p className="text-muted-foreground">
            {upperTicker} was not found in the database. Seed ETF data first.
          </p>
        </div>
      </div>
    );
  }

  const price = etf.price ? parseFloat(etf.price) : null;
  const change1d = etf.priceChange1d ? parseFloat(etf.priceChange1d) : null;
  const isPositive = (change1d ?? 0) >= 0;

  // Parse sector data from holdings
  const sectorMap = new Map<string, number>();
  topHoldings.forEach((h) => {
    if (h.sector) {
      const w = h.weight ? parseFloat(h.weight) : 0;
      sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + w);
    }
  });
  const sectorData = Array.from(sectorMap.entries()).map(([sector, weight]) => ({
    sector,
    weight,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold font-mono">{upperTicker}</h1>
            {etf.isBlackrock && <Badge>iShares</Badge>}
            {etf.category && (
              <Badge variant="outline">{etf.category}</Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{etf.name}</p>
          {etf.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl line-clamp-2">
              {etf.description}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-3xl font-bold tabular-nums">
              {price != null ? `$${price.toFixed(2)}` : "N/A"}
            </span>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <PriceChange value={change1d} className="text-lg" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatItem label="AUM" value={etf.aum}>
          <LargeNumber value={etf.aum ? parseFloat(etf.aum) : null} />
        </StatItem>
        <StatItem label="Expense Ratio">
          {etf.expenseRatio
            ? `${(parseFloat(etf.expenseRatio) * 100).toFixed(2)}%`
            : "N/A"}
        </StatItem>
        <StatItem label="Dividend Yield">
          {etf.dividendYield
            ? `${parseFloat(etf.dividendYield).toFixed(2)}%`
            : "N/A"}
        </StatItem>
        <StatItem label="Holdings">
          {etf.holdingsCount?.toLocaleString() || "N/A"}
        </StatItem>
        <StatItem label="Inception">
          {etf.inceptionDate || "N/A"}
        </StatItem>
        <StatItem label="Index">
          {etf.indexTracked || "N/A"}
        </StatItem>
      </div>

      {/* Performance Row */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <PerfItem label="1D" value={etf.priceChange1d} />
            <PerfItem label="1W" value={etf.priceChange1w} />
            <PerfItem label="1M" value={etf.priceChange1m} />
            <PerfItem label="3M" value={etf.priceChange3m} />
            <PerfItem label="YTD" value={etf.priceChangeYtd} />
            <PerfItem label="1Y" value={etf.priceChange1y} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <EtfPriceChartWrapper ticker={upperTicker} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <SectorPieChart sectors={sectorData} />
              </CardContent>
            </Card>
          </div>

          {/* Top Holdings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Holdings</CardTitle>
              <Link
                href={`/etf/${upperTicker}/holdings`}
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <HoldingsTable holdings={topHoldings.slice(0, 10)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holdings">
          <Card>
            <CardHeader>
              <CardTitle>All Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <FullHoldingsTable ticker={upperTicker} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="font-semibold mb-2">Compare {upperTicker} with competitors</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See how this ETF stacks up against similar funds
                </p>
                <Link
                  href={`/compare/${upperTicker}-vs-VOO-vs-SPY`}
                  className="text-primary hover:underline text-sm"
                >
                  Go to Comparison Tool
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatItem({
  label,
  children,
  value,
}: {
  label: string;
  children: React.ReactNode;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-sm">{children}</p>
    </div>
  );
}

function PerfItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <PriceChange
        value={value ? parseFloat(value) : null}
        className="text-sm"
      />
    </div>
  );
}
