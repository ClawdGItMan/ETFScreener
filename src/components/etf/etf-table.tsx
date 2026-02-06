"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceChange, LargeNumber } from "@/components/shared/number-format";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

interface EtfRow {
  ticker: string;
  name: string;
  issuer: string;
  category: string | null;
  price: string | null;
  priceChange1d: string | null;
  priceChange1w: string | null;
  priceChange1m: string | null;
  aum: string | null;
  expenseRatio: string | null;
  dividendYield: string | null;
  isBlackrock: boolean | null;
}

interface EtfTableProps {
  data: EtfRow[];
  currentPage: number;
  totalPages: number;
  total: number;
  currentSort: string;
  currentOrder: string;
}

export function EtfTable({
  data,
  currentPage,
  totalPages,
  total,
  currentSort,
  currentOrder,
}: EtfTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => params.set(k, v));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const toggleSort = (col: string) => {
    const newOrder =
      currentSort === col && currentOrder === "desc" ? "asc" : "desc";
    updateParams({ sort: col, order: newOrder, page: "1" });
  };

  const SortHeader = ({
    col,
    children,
    className,
  }: {
    col: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  );

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader col="ticker">Ticker</SortHeader>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead>Issuer</TableHead>
              <SortHeader col="price" className="text-right">
                Price
              </SortHeader>
              <SortHeader col="price_change_1d" className="text-right">
                1D
              </SortHeader>
              <SortHeader col="price_change_1w" className="text-right">
                1W
              </SortHeader>
              <SortHeader col="price_change_1m" className="text-right">
                1M
              </SortHeader>
              <SortHeader col="aum" className="text-right">
                AUM
              </SortHeader>
              <SortHeader col="expense_ratio" className="text-right">
                Exp. Ratio
              </SortHeader>
              <SortHeader col="dividend_yield" className="text-right">
                Yield
              </SortHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No ETFs found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map((etf) => (
                <TableRow key={etf.ticker} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/etf/${etf.ticker}`}
                      className="font-mono font-bold text-primary hover:underline"
                    >
                      {etf.ticker}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/etf/${etf.ticker}`}
                      className="text-sm hover:underline line-clamp-1"
                    >
                      {etf.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={etf.isBlackrock ? "default" : "outline"}
                      className="text-xs"
                    >
                      {etf.issuer === "BlackRock" ? "iShares" : etf.issuer}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {etf.price != null ? `$${parseFloat(etf.price).toFixed(2)}` : "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceChange
                      value={etf.priceChange1d != null ? parseFloat(etf.priceChange1d) : null}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceChange
                      value={etf.priceChange1w != null ? parseFloat(etf.priceChange1w) : null}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceChange
                      value={etf.priceChange1m != null ? parseFloat(etf.priceChange1m) : null}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <LargeNumber value={etf.aum != null ? parseFloat(etf.aum) : null} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {etf.expenseRatio != null
                      ? `${(parseFloat(etf.expenseRatio) * 100).toFixed(2)}%`
                      : "--"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {etf.dividendYield != null
                      ? `${parseFloat(etf.dividendYield).toFixed(2)}%`
                      : "--"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * data.length + 1}-
          {Math.min(currentPage * 20, total)} of {total} ETFs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateParams({ page: String(currentPage - 1) })}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateParams({ page: String(currentPage + 1) })}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
