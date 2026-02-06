import { notFound } from "next/navigation";
import { getEtfByTicker } from "@/lib/db/queries/etfs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullHoldingsTable } from "@/components/holdings/full-holdings-table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HoldingsPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function HoldingsPage({ params }: HoldingsPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  let etf;
  try {
    etf = await getEtfByTicker(upperTicker);
  } catch {
    // DB not connected
  }

  if (!etf) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/etf/${upperTicker}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {upperTicker}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">
          <span className="font-mono">{upperTicker}</span> Holdings
        </h1>
        {etf.isBlackrock && <Badge>iShares</Badge>}
      </div>
      <p className="text-muted-foreground">{etf.name}</p>

      <Card>
        <CardContent className="p-6">
          <FullHoldingsTable ticker={upperTicker} />
        </CardContent>
      </Card>
    </div>
  );
}
