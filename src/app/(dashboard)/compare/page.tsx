import { db } from "@/lib/db";
import { etfs, etfComparisons } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { CompareSelector } from "@/components/compare/compare-selector";
import { GitCompare } from "lucide-react";

export default async function CompareIndexPage() {
  let allEtfs: { ticker: string; name: string; issuer: string | null }[] = [];
  let presetGroups: {
    groupName: string;
    groupSlug: string;
    tickers: string[];
    category: string | null;
  }[] = [];

  try {
    const rows = await db
      .select({
        ticker: etfs.ticker,
        name: etfs.name,
        issuer: etfs.issuer,
      })
      .from(etfs)
      .orderBy(asc(etfs.ticker));

    allEtfs = rows;

    const groups = await db
      .select({
        groupName: etfComparisons.groupName,
        groupSlug: etfComparisons.groupSlug,
        tickers: etfComparisons.tickers,
        category: etfComparisons.category,
      })
      .from(etfComparisons)
      .orderBy(asc(etfComparisons.groupName));

    presetGroups = groups.map((g) => ({
      ...g,
      tickers: JSON.parse(g.tickers) as string[],
    }));
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">ETF Comparison</h1>
        </div>
        <p className="text-muted-foreground">
          Select 2 to 5 ETFs to compare side-by-side
        </p>
      </div>

      <CompareSelector allEtfs={allEtfs} presetGroups={presetGroups} />
    </div>
  );
}
