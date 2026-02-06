"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface HoldingRow {
  securityTicker: string | null;
  securityName: string;
  sector: string | null;
  weight: string | null;
  shares: string | null;
  marketValue: string | null;
}

interface HoldingsResponse {
  data: HoldingRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SortField = "weight" | "name" | "ticker" | "marketValue" | "shares";

export function FullHoldingsTable({ ticker }: { ticker: string }) {
  const [data, setData] = useState<HoldingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortField>("weight");
  const [loading, setLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchHoldings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });
      if (debouncedSearch) params.set("q", debouncedSearch);

      const res = await fetch(`/api/etfs/${ticker}/holdings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: HoldingsResponse = await res.json();
      setData(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch {
      setData([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [ticker, page, limit, sort, debouncedSearch]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const handleSort = (field: SortField) => {
    setSort(field);
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort === field) return <ArrowDown className="h-3 w-3 inline ml-1" />;
    return <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-40" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticker or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {total.toLocaleString()} total holdings
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <button onClick={() => handleSort("ticker")} className="hover:text-foreground flex items-center">
                  Ticker <SortIcon field="ticker" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => handleSort("name")} className="hover:text-foreground flex items-center">
                  Name <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right">
                <button onClick={() => handleSort("weight")} className="hover:text-foreground flex items-center justify-end">
                  Weight <SortIcon field="weight" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button onClick={() => handleSort("shares")} className="hover:text-foreground flex items-center justify-end">
                  Shares <SortIcon field="shares" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button onClick={() => handleSort("marketValue")} className="hover:text-foreground flex items-center justify-end">
                  Market Value <SortIcon field="marketValue" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {debouncedSearch
                    ? `No holdings matching "${debouncedSearch}"`
                    : "No holdings data available."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((h, i) => {
                const weight = h.weight ? parseFloat(h.weight) : 0;
                return (
                  <TableRow key={`${h.securityTicker}-${i}`}>
                    <TableCell className="font-mono font-medium text-sm">
                      {h.securityTicker || "--"}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{h.securityName}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {h.sector || "--"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(weight * 2, 100)}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-sm font-medium w-14 text-right">
                          {weight.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {h.shares
                        ? parseFloat(h.shares).toLocaleString()
                        : "--"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {h.marketValue
                        ? `$${parseFloat(h.marketValue).toLocaleString()}`
                        : "--"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-3 tabular-nums">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
