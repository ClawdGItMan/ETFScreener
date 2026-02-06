"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { formatLargeNumber } from "@/lib/utils/format";

interface SearchResult {
  ticker: string;
  name: string;
  issuer: string;
  category: string | null;
  aum: string | null;
}

export function EtfSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full max-w-sm justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search ETFs...
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search by ticker or name..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No ETFs found."}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="ETFs">
              {results.map((etf) => (
                <CommandItem
                  key={etf.ticker}
                  value={`${etf.ticker} ${etf.name}`}
                  onSelect={() => {
                    router.push(`/etf/${etf.ticker}`);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm">
                        {etf.ticker}
                      </span>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {etf.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{etf.issuer}</span>
                      {etf.aum && (
                        <span>
                          {formatLargeNumber(parseFloat(etf.aum))}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
