"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Layers, Building2 } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { formatLargeNumber } from "@/lib/utils/format";

interface SearchResult {
  ticker: string;
  name: string;
  issuer: string;
  category: string | null;
  aum: string | null;
  matchType?: string;
}

interface HoldingResult {
  etfTicker: string;
  etfName: string;
  etfIssuer: string;
  etfCategory: string | null;
  etfAum: string | null;
  securityTicker: string | null;
  securityName: string;
  weight: string | null;
}

export function EtfSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [holdingResults, setHoldingResults] = useState<HoldingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      setHoldingResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setHoldingResults(data.holdingResults || []);
    } catch {
      setResults([]);
      setHoldingResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (ticker: string) => {
    router.push(`/etf/${ticker}`);
    setOpen(false);
    setQuery("");
  };

  const hasResults = results.length > 0 || holdingResults.length > 0;

  // Deduplicate holding results (same ETF may appear multiple times)
  const uniqueHoldingResults = holdingResults.reduce((acc, curr) => {
    if (!acc.find((r) => r.etfTicker === curr.etfTicker)) {
      acc.push(curr);
    }
    return acc;
  }, [] as HoldingResult[]);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full max-w-sm justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search ETFs, stocks, sectors...
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search by ticker, name, sector, stock holding..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              "Searching..."
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No results found for "{query}"
                </p>
                <p className="text-xs text-muted-foreground">
                  Try: "tech", "crypto", "AAPL", "dividend", "vanguard"
                </p>
              </div>
            )}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="ETFs">
              {results.map((etf) => (
                <CommandItem
                  key={etf.ticker}
                  value={`etf-${etf.ticker}`}
                  onSelect={() => handleSelect(etf.ticker)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-sm">
                          {etf.ticker}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2 truncate max-w-[180px] inline-block align-middle">
                          {etf.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {etf.category && (
                        <span className="hidden sm:inline">{etf.category}</span>
                      )}
                      {etf.aum && (
                        <span className="font-medium">
                          {formatLargeNumber(parseFloat(etf.aum))}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {uniqueHoldingResults.length > 0 && results.length > 0 && (
            <CommandSeparator />
          )}

          {uniqueHoldingResults.length > 0 && (
            <CommandGroup heading={`ETFs holding "${query.toUpperCase()}"`}>
              {uniqueHoldingResults.map((holding) => (
                <CommandItem
                  key={`holding-${holding.etfTicker}-${holding.securityTicker}`}
                  value={`holding-${holding.etfTicker}`}
                  onSelect={() => handleSelect(holding.etfTicker)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center">
                        <Layers className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-sm">
                          {holding.etfTicker}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2 truncate max-w-[140px] inline-block align-middle">
                          {holding.etfName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-600 font-medium">
                        {holding.weight
                          ? `${parseFloat(holding.weight).toFixed(2)}%`
                          : ""}
                      </span>
                      {holding.etfAum && (
                        <span className="text-muted-foreground">
                          {formatLargeNumber(parseFloat(holding.etfAum))}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!hasResults && !loading && query.length > 0 && (
            <div className="py-2 px-4">
              <p className="text-xs text-muted-foreground">
                <strong>Search tips:</strong>
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>• ETF ticker: "IVV", "VOO", "IBIT"</li>
                <li>• Sector: "tech", "healthcare", "energy"</li>
                <li>• Stock holding: "AAPL", "NVDA", "MSFT"</li>
                <li>• Category: "crypto", "dividend", "growth"</li>
                <li>• Issuer: "blackrock", "vanguard"</li>
              </ul>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
