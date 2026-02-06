import { getEtfsByTickers } from "@/lib/db/queries/etfs";
import { getAllHoldingsForETF } from "@/lib/db/queries/holdings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PriceChange, LargeNumber } from "@/components/shared/number-format";
import { computePairwiseOverlap } from "@/lib/utils/calculations";
import { ArrowLeft, GitCompare } from "lucide-react";
import Link from "next/link";

interface ComparePageProps {
  params: Promise<{ slugs: string }>;
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slugs } = await params;
  const tickers = slugs
    .toUpperCase()
    .split("-VS-")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (tickers.length < 2) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          Provide at least 2 tickers to compare (e.g., /compare/IVV-vs-VOO)
        </p>
      </div>
    );
  }

  let etfs: Awaited<ReturnType<typeof getEtfsByTickers>> = [];
  let overlapResults: ReturnType<typeof computePairwiseOverlap> = [];

  try {
    etfs = await getEtfsByTickers(tickers);

    // Compute overlap
    const holdingsMap: Record<string, { securityTicker: string | null }[]> = {};
    for (const t of tickers) {
      const h = await getAllHoldingsForETF(t);
      holdingsMap[t] = h;
    }
    overlapResults = computePairwiseOverlap(holdingsMap);
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">ETF Comparison</h1>
        </div>
        <p className="text-muted-foreground">
          Comparing {tickers.join(" vs ")}
        </p>
      </div>

      {etfs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No ETF data found. Make sure these tickers exist in the database.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Metrics Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Metric</TableHead>
                      {etfs.map((etf) => (
                        <TableHead key={etf.ticker} className="text-center min-w-[120px]">
                          <Link
                            href={`/etf/${etf.ticker}`}
                            className="font-mono font-bold text-primary hover:underline"
                          >
                            {etf.ticker}
                          </Link>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <MetricRow label="Name" etfs={etfs} getValue={(e) => e.name} />
                    <MetricRow label="Issuer" etfs={etfs} getValue={(e) => e.issuer} />
                    <MetricRow
                      label="Price"
                      etfs={etfs}
                      getValue={(e) =>
                        e.price ? `$${parseFloat(e.price).toFixed(2)}` : "N/A"
                      }
                    />
                    <MetricRow
                      label="1D Change"
                      etfs={etfs}
                      renderValue={(e) => (
                        <PriceChange
                          value={e.priceChange1d ? parseFloat(e.priceChange1d) : null}
                        />
                      )}
                    />
                    <MetricRow
                      label="1M Change"
                      etfs={etfs}
                      renderValue={(e) => (
                        <PriceChange
                          value={e.priceChange1m ? parseFloat(e.priceChange1m) : null}
                        />
                      )}
                    />
                    <MetricRow
                      label="1Y Change"
                      etfs={etfs}
                      renderValue={(e) => (
                        <PriceChange
                          value={e.priceChange1y ? parseFloat(e.priceChange1y) : null}
                        />
                      )}
                    />
                    <MetricRow
                      label="AUM"
                      etfs={etfs}
                      renderValue={(e) => (
                        <LargeNumber value={e.aum ? parseFloat(e.aum) : null} />
                      )}
                    />
                    <MetricRow
                      label="Expense Ratio"
                      etfs={etfs}
                      getValue={(e) =>
                        e.expenseRatio
                          ? `${(parseFloat(e.expenseRatio) * 100).toFixed(2)}%`
                          : "N/A"
                      }
                      highlight="lowest"
                      getNumericValue={(e) =>
                        e.expenseRatio ? parseFloat(e.expenseRatio) : Infinity
                      }
                    />
                    <MetricRow
                      label="Yield"
                      etfs={etfs}
                      getValue={(e) =>
                        e.dividendYield
                          ? `${parseFloat(e.dividendYield).toFixed(2)}%`
                          : "N/A"
                      }
                    />
                    <MetricRow
                      label="Holdings"
                      etfs={etfs}
                      getValue={(e) =>
                        e.holdingsCount?.toLocaleString() || "N/A"
                      }
                    />
                    <MetricRow
                      label="Index Tracked"
                      etfs={etfs}
                      getValue={(e) => e.indexTracked || "N/A"}
                    />
                    <MetricRow
                      label="Inception"
                      etfs={etfs}
                      getValue={(e) => e.inceptionDate || "N/A"}
                    />
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Holdings Overlap */}
          {overlapResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Holdings Overlap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overlapResults.map((o) => (
                    <div
                      key={`${o.pair[0]}-${o.pair[1]}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="font-mono">
                          {o.pair[0]}
                        </Badge>
                        <span className="text-muted-foreground text-sm">vs</span>
                        <Badge variant="outline" className="font-mono">
                          {o.pair[1]}
                        </Badge>
                      </div>

                      <div className="text-3xl font-bold text-primary mb-1">
                        {o.overlapPct.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {o.sharedCount} shared holdings
                      </p>

                      <div className="mt-3 flex gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Only in {o.pair[0]}:
                          </span>
                          <span className="ml-1 font-medium">{o.uniqueA}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Only in {o.pair[1]}:
                          </span>
                          <span className="ml-1 font-medium">{o.uniqueB}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function MetricRow({
  label,
  etfs,
  getValue,
  renderValue,
  highlight,
  getNumericValue,
}: {
  label: string;
  etfs: Awaited<ReturnType<typeof getEtfsByTickers>>;
  getValue?: (etf: Awaited<ReturnType<typeof getEtfsByTickers>>[0]) => string;
  renderValue?: (etf: Awaited<ReturnType<typeof getEtfsByTickers>>[0]) => React.ReactNode;
  highlight?: "lowest" | "highest";
  getNumericValue?: (etf: Awaited<ReturnType<typeof getEtfsByTickers>>[0]) => number;
}) {
  let bestIndex = -1;
  if (highlight && getNumericValue) {
    const values = etfs.map(getNumericValue);
    const best =
      highlight === "lowest" ? Math.min(...values) : Math.max(...values);
    bestIndex = values.indexOf(best);
  }

  return (
    <TableRow>
      <TableCell className="font-medium text-sm">{label}</TableCell>
      {etfs.map((etf, i) => (
        <TableCell
          key={etf.ticker}
          className={`text-center text-sm ${
            i === bestIndex ? "font-bold text-primary" : ""
          }`}
        >
          {renderValue ? renderValue(etf) : getValue?.(etf) || "N/A"}
        </TableCell>
      ))}
    </TableRow>
  );
}
