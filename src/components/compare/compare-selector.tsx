"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X, Search, GitCompare } from "lucide-react";

interface ETFOption {
  ticker: string;
  name: string;
  issuer: string | null;
}

interface CompareSelectorProps {
  allEtfs: ETFOption[];
  presetGroups: {
    groupName: string;
    groupSlug: string;
    tickers: string[];
    category: string | null;
  }[];
}

export function CompareSelector({ allEtfs, presetGroups }: CompareSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? allEtfs.filter(
        (etf) =>
          !selected.includes(etf.ticker) &&
          (etf.ticker.toLowerCase().includes(query.toLowerCase()) ||
            etf.name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const addTicker = useCallback(
    (ticker: string) => {
      if (selected.length >= 5) return;
      if (!selected.includes(ticker)) {
        setSelected((prev) => [...prev, ticker]);
      }
      setQuery("");
    },
    [selected]
  );

  const removeTicker = useCallback((ticker: string) => {
    setSelected((prev) => prev.filter((t) => t !== ticker));
  }, []);

  const goCompare = () => {
    if (selected.length < 2) return;
    const slug = selected.join("-vs-");
    router.push(`/compare/${slug}`);
  };

  const loadPreset = (tickers: string[]) => {
    setSelected(tickers.slice(0, 5));
  };

  return (
    <div className="space-y-6">
      {/* Selected ETFs */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Selected ETFs ({selected.length}/5)
        </label>
        <div className="flex flex-wrap gap-2 min-h-[40px] rounded-lg border bg-card p-3">
          {selected.length === 0 && (
            <span className="text-sm text-muted-foreground">
              Search below or pick a preset to get started
            </span>
          )}
          {selected.map((ticker) => (
            <Badge
              key={ticker}
              variant="secondary"
              className="text-sm py-1 px-3 gap-1.5"
            >
              <span className="font-mono font-bold">{ticker}</span>
              <button
                onClick={() => removeTicker(ticker)}
                className="ml-1 rounded-full hover:bg-foreground/10 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ticker or name (e.g. VOO, Vanguard)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          disabled={selected.length >= 5}
        />

        {/* Search results dropdown */}
        {filtered.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 shadow-lg">
            <CardContent className="p-1 max-h-[240px] overflow-y-auto">
              {filtered.slice(0, 20).map((etf) => (
                <button
                  key={etf.ticker}
                  onClick={() => addTicker(etf.ticker)}
                  className="flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold w-12">
                      {etf.ticker}
                    </span>
                    <span className="text-muted-foreground truncate max-w-[300px]">
                      {etf.name}
                    </span>
                  </div>
                  {etf.issuer && (
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      {etf.issuer}
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Compare button */}
      <Button
        onClick={goCompare}
        disabled={selected.length < 2}
        className="w-full sm:w-auto"
        size="lg"
      >
        <GitCompare className="h-4 w-4 mr-2" />
        Compare {selected.length} ETFs
      </Button>

      {/* Preset groups */}
      {presetGroups.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Quick Presets
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {presetGroups.map((group) => (
              <button
                key={group.groupSlug}
                onClick={() => loadPreset(group.tickers)}
                className="text-left rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <p className="text-sm font-medium">{group.groupName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {group.tickers.join(", ")}
                </p>
                {group.category && (
                  <Badge variant="outline" className="text-xs mt-2">
                    {group.category}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
