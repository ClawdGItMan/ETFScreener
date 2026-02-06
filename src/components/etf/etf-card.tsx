import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceChange, LargeNumber } from "@/components/shared/number-format";
import { TrendingUp, TrendingDown } from "lucide-react";

interface EtfCardProps {
  ticker: string;
  name: string;
  price: number | null;
  priceChange1d: number | null;
  aum: number | null;
  expenseRatio: number | null;
  category: string | null;
  issuer: string;
  isBlackrock: boolean;
}

export function EtfCard({
  ticker,
  name,
  price,
  priceChange1d,
  aum,
  expenseRatio,
  category,
  issuer,
  isBlackrock,
}: EtfCardProps) {
  const isPositive = (priceChange1d ?? 0) >= 0;

  return (
    <Link href={`/etf/${ticker}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">{ticker}</span>
                {isBlackrock && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    iShares
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {name}
              </p>
            </div>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold tabular-nums">
              {price != null ? `$${price.toFixed(2)}` : "N/A"}
            </span>
            <PriceChange value={priceChange1d} className="text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">AUM</span>
              <div className="font-medium">
                <LargeNumber value={aum} />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Expense Ratio</span>
              <div className="font-medium">
                {expenseRatio != null
                  ? `${(expenseRatio * 100).toFixed(2)}%`
                  : "N/A"}
              </div>
            </div>
          </div>

          {category && (
            <div className="mt-2">
              <Badge variant="outline" className="text-[10px]">
                {category}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
