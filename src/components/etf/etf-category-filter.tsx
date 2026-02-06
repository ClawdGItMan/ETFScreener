"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ASSET_CLASSES = [
  "All",
  "Equity",
  "Fixed Income",
  "Commodity",
  "Multi-Asset",
];

const ISSUER_FILTERS = [
  "All Issuers",
  "BlackRock Only",
];

export function EtfCategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentAssetClass = searchParams.get("asset_class") || "All";
  const currentBlackrock = searchParams.get("blackrock") === "true";

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null) params.delete(k);
      else params.set(k, v);
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex flex-wrap gap-1.5">
        {ASSET_CLASSES.map((ac) => (
          <Button
            key={ac}
            variant={
              (ac === "All" && !searchParams.get("asset_class")) ||
              currentAssetClass === ac
                ? "default"
                : "outline"
            }
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              updateParams({
                asset_class: ac === "All" ? null : ac,
              })
            }
          >
            {ac}
          </Button>
        ))}
      </div>

      <div className="flex gap-1.5">
        <Button
          variant={!currentBlackrock ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => updateParams({ blackrock: null })}
        >
          All Issuers
        </Button>
        <Button
          variant={currentBlackrock ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => updateParams({ blackrock: "true" })}
        >
          BlackRock Only
        </Button>
      </div>
    </div>
  );
}
