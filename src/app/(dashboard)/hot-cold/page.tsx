import { getFilteredEtfs } from "@/lib/db/queries/etfs";
import {
  computeMomentumScore,
  getHeatLevel,
} from "@/lib/utils/calculations";
import { HEAT_LEVEL_COLORS } from "@/lib/utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceChange } from "@/components/shared/number-format";
import { Flame, Snowflake, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export default async function HotColdPage() {
  let allEtfs: Awaited<ReturnType<typeof getFilteredEtfs>> = [];

  try {
    allEtfs = await getFilteredEtfs({
      sort: "aum",
      order: "desc",
      limit: 100,
      offset: 0,
    });
  } catch {
    // DB not connected
  }

  const scored = allEtfs
    .map((etf) => {
      const score = computeMomentumScore({
        priceChange1w: etf.priceChange1w ? parseFloat(etf.priceChange1w) : null,
        priceChange1m: etf.priceChange1m ? parseFloat(etf.priceChange1m) : null,
        avgVolume: etf.avgVolume ? parseFloat(etf.avgVolume) : null,
      });
      return {
        ...etf,
        momentumScore: score,
        heatLevel: getHeatLevel(score),
      };
    })
    .sort((a, b) => b.momentumScore - a.momentumScore);

  const hotEtfs = scored.filter((e) => e.heatLevel === "hot" || e.heatLevel === "warm");
  const coldEtfs = scored
    .filter((e) => e.heatLevel === "cold" || e.heatLevel === "cool")
    .reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hot & Cold ETFs</h1>
        <p className="text-muted-foreground mt-1">
          Momentum rankings based on recent price performance and volume.
        </p>
      </div>

      {scored.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No ETF data available. Seed the database first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hot ETFs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                Hot ETFs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hotEtfs.length > 0 ? hotEtfs : scored.slice(0, 10)).map(
                  (etf, i) => (
                    <MomentumItem key={etf.ticker} etf={etf} rank={i + 1} />
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cold ETFs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-blue-500" />
                Cold ETFs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(coldEtfs.length > 0
                  ? coldEtfs
                  : scored.slice(-10).reverse()
                ).map((etf, i) => (
                  <MomentumItem key={etf.ticker} etf={etf} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Heatmap */}
      {scored.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {scored.slice(0, 20).map((etf) => (
                <Link key={etf.ticker} href={`/etf/${etf.ticker}`}>
                  <div
                    className="rounded-lg p-3 border hover:shadow-sm transition-shadow"
                    style={{
                      borderLeftWidth: "3px",
                      borderLeftColor:
                        HEAT_LEVEL_COLORS[etf.heatLevel],
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm">
                        {etf.ticker}
                      </span>
                      <HeatBadge level={etf.heatLevel} />
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">1D</span>
                        <PriceChange
                          value={
                            etf.priceChange1d
                              ? parseFloat(etf.priceChange1d)
                              : null
                          }
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground">1W</span>
                        <PriceChange
                          value={
                            etf.priceChange1w
                              ? parseFloat(etf.priceChange1w)
                              : null
                          }
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground">1M</span>
                        <PriceChange
                          value={
                            etf.priceChange1m
                              ? parseFloat(etf.priceChange1m)
                              : null
                          }
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MomentumItem({
  etf,
  rank,
}: {
  etf: {
    ticker: string;
    name: string;
    momentumScore: number;
    heatLevel: string;
    priceChange1d: string | null;
    priceChange1w: string | null;
    priceChange1m: string | null;
    price: string | null;
  };
  rank: number;
}) {
  return (
    <Link href={`/etf/${etf.ticker}`}>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <span className="text-sm font-medium text-muted-foreground w-6">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm">{etf.ticker}</span>
            <span className="text-xs text-muted-foreground truncate">
              {etf.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <PriceChange
            value={
              etf.priceChange1w ? parseFloat(etf.priceChange1w) : null
            }
            className="text-xs"
          />
          <PriceChange
            value={
              etf.priceChange1m ? parseFloat(etf.priceChange1m) : null
            }
            className="text-xs"
          />
          <HeatBadge level={etf.heatLevel} />
        </div>
      </div>
    </Link>
  );
}

function HeatBadge({ level }: { level: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    hot: { label: "HOT", variant: "destructive" },
    warm: { label: "WARM", variant: "default" },
    neutral: { label: "NEUTRAL", variant: "secondary" },
    cool: { label: "COOL", variant: "outline" },
    cold: { label: "COLD", variant: "outline" },
  };

  const c = config[level] || config.neutral;
  return (
    <Badge variant={c.variant} className="text-[10px] px-1.5 py-0">
      {c.label}
    </Badge>
  );
}
