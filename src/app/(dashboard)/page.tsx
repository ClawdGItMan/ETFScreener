import { Suspense } from "react";
import { getFilteredEtfs, getEtfCount } from "@/lib/db/queries/etfs";
import { EtfGrid } from "@/components/etf/etf-grid";
import { EtfTable } from "@/components/etf/etf-table";
import { EtfCategoryFilter } from "@/components/etf/etf-category-filter";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, BarChart3 } from "lucide-react";
import Link from "next/link";

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    order?: string;
    asset_class?: string;
    blackrock?: string;
    view?: string;
    q?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sort = params.sort || "aum";
  const order = (params.order as "asc" | "desc") || "desc";
  const assetClass = params.asset_class;
  const blackrockOnly = params.blackrock === "true";
  const view = params.view || "grid";
  const search = params.q;
  const limit = 20;

  let etfs: Awaited<ReturnType<typeof getFilteredEtfs>> = [];
  let total = 0;

  try {
    [etfs, total] = await Promise.all([
      getFilteredEtfs({
        sort,
        order,
        assetClass,
        blackrockOnly,
        search,
        limit,
        offset: (page - 1) * limit,
      }),
      getEtfCount({ assetClass, blackrockOnly, search }),
    ]);
  } catch {
    // DB not connected yet - show demo state
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ETF Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track and analyze BlackRock iShares ETFs and their competitors.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total ETFs" value={total || "--"} />
        <StatsCard title="BlackRock ETFs" value={blackrockOnly ? total : "--"} />
        <StatsCard title="Categories" value="--" />
        <StatsCard title="Last Updated" value="--" />
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Suspense fallback={null}>
          <EtfCategoryFilter />
        </Suspense>

        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Link
            href={`?${new URLSearchParams({ ...params, view: "grid" }).toString()}`}
          >
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            href={`?${new URLSearchParams({ ...params, view: "table" }).toString()}`}
          >
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ETF Data */}
      {etfs.length === 0 && total === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No ETF Data Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect your database and run the seed script to populate ETF data.
            Check the .env.example file for required environment variables.
          </p>
        </div>
      ) : view === "table" ? (
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
        <EtfGrid etfs={etfs} />
      )}
    </div>
  );
}

function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
