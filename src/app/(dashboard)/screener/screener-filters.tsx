"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ISSUERS } from "@/lib/utils/constants";
import { X } from "lucide-react";

export function ScreenerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Search ticker or name..."
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => {
          const timer = setTimeout(() => updateParam("q", e.target.value), 500);
          return () => clearTimeout(timer);
        }}
        className="w-[200px]"
      />

      <Select
        value={searchParams.get("issuer") || "all"}
        onValueChange={(v) => updateParam("issuer", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Issuer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Issuers</SelectItem>
          {ISSUERS.map((issuer) => (
            <SelectItem key={issuer} value={issuer}>
              {issuer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("asset_class") || "all"}
        onValueChange={(v) =>
          updateParam("asset_class", v === "all" ? null : v)
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Asset Class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Asset Classes</SelectItem>
          <SelectItem value="Equity">Equity</SelectItem>
          <SelectItem value="Fixed Income">Fixed Income</SelectItem>
          <SelectItem value="Commodity">Commodity</SelectItem>
          <SelectItem value="Multi-Asset">Multi-Asset</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={clearAll}>
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
  );
}
