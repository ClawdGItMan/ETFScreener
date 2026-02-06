import { Suspense } from "react";
import { getFilteredEtfs, getEtfCount } from "@/lib/db/queries/etfs";
import { EtfTable } from "@/components/etf/etf-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, SlidersHorizontal } from "lucide-react";
import { ScreenerFilters } from "./screener-filters";

interface ScreenerPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    order?: string;
    issuer?: string;
    category?: string;
    asset_class?: string;
    blackrock?: string;
    q?: string;
  }>;
}

export default async function ScreenerPage({
  searchParams,
}: ScreenerPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sort = params.sort || "aum";
  const order = (params.order as "asc" | "desc") || "desc";
  const limit = 20;

  let etfs: Awaited<ReturnType<typeof getFilteredEtfs>> = [];
  let total = 0;

  try {
    [etfs, total] = await Promise.all([
      getFilteredEtfs({
        sort,
        order,
        issuer: params.issuer,
        category: params.category,
        assetClass: params.asset_class,
        blackrockOnly: params.blackrock === "true",
        search: params.q,
        limit,
        offset: (page - 1) * limit,
      }),
      getEtfCount({
        issuer: params.issuer,
        category: params.category,
        assetClass: params.asset_class,
        blackrockOnly: params.blackrock === "true",
        search: params.q,
      }),
    ]);
  } catch {
    // DB not connected
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">ETF Screener</h1>
        </div>
        <p className="text-muted-foreground">
          Filter and search across all tracked ETFs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <ScreenerFilters />
          </Suspense>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {total} ETFs found
        </p>
        {etfs.length > 0 ? (
          <Suspense fallback={<div>Loading...</div>}>
            <EtfTable
              data={etfs}
              currentPage={page}
              totalPages={totalPages}
              total={total}
              currentSort={sort}
              currentOrder={order}
            />
          </Suspense>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2" />
              No ETFs match your filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
