"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

interface HoldingRow {
  securityTicker: string | null;
  securityName: string;
  sector: string | null;
  weight: string | null;
  shares: string | null;
  marketValue: string | null;
}

export function HoldingsTable({ holdings }: { holdings: HoldingRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = holdings.filter(
    (h) =>
      h.securityName.toLowerCase().includes(search.toLowerCase()) ||
      (h.securityTicker?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search holdings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ticker</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No holdings found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((h, i) => {
                const weight = h.weight ? parseFloat(h.weight) : 0;
                return (
                  <TableRow key={`${h.securityTicker}-${i}`}>
                    <TableCell className="font-mono font-medium text-sm">
                      {h.securityTicker || "--"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{h.securityName}</span>
                      </div>
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
    </div>
  );
}
