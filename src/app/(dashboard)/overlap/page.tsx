"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, X, Search } from "lucide-react";
import type { OverlapResult } from "@/types/etf";

export default function OverlapPage() {
  const [tickers, setTickers] = useState<string[]>(["IVV", "VOO", "QQQ"]);
  const [newTicker, setNewTicker] = useState("");
  const [results, setResults] = useState<OverlapResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const addTicker = () => {
    if (!newTicker) return;
    const t = newTicker.toUpperCase().trim();
    if (tickers.includes(t) || tickers.length >= 5) return;
    setTickers([...tickers, t]);
    setNewTicker("");
  };

  const removeTicker = (t: string) => {
    setTickers(tickers.filter((x) => x !== t));
    setResults(null);
  };

  const analyze = async () => {
    if (tickers.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch("/api/overlap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Holdings Overlap Analyzer
          </h1>
        </div>
        <p className="text-muted-foreground">
          See how much overlap exists between ETFs in your portfolio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select ETFs (2-5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add ticker"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTicker()}
              className="max-w-[200px]"
            />
            <Button onClick={addTicker} size="sm" disabled={tickers.length >= 5}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {tickers.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="font-mono text-sm px-3 py-1"
              >
                {t}
                <button
                  onClick={() => removeTicker(t)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <Button
            onClick={analyze}
            disabled={tickers.length < 2 || loading}
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Analyzing..." : "Analyze Overlap"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <Card key={`${r.pair[0]}-${r.pair[1]}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-mono">
                    {r.pair[0]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">vs</span>
                  <Badge variant="outline" className="font-mono">
                    {r.pair[1]}
                  </Badge>
                </div>

                <div className="text-3xl font-bold text-primary mb-1">
                  {r.overlapPct.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {r.sharedCount} shared holdings
                </p>

                {/* Visual overlap bar */}
                <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${r.overlapPct}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">
                      Unique to {r.pair[0]}:
                    </span>
                    <span className="ml-1 font-medium">{r.uniqueA}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Unique to {r.pair[1]}:
                    </span>
                    <span className="ml-1 font-medium">{r.uniqueB}</span>
                  </div>
                </div>

                {r.sharedHoldings.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Top shared:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {r.sharedHoldings.slice(0, 8).map((h) => (
                        <Badge
                          key={h}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {h}
                        </Badge>
                      ))}
                      {r.sharedHoldings.length > 8 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{r.sharedHoldings.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
