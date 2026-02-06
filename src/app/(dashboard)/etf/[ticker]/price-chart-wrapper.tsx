"use client";

import { useState, useEffect } from "react";
import { PriceChart } from "@/components/charts/price-chart";

interface PriceData {
  date: string;
  close: number;
}

export function EtfPriceChartWrapper({ ticker }: { ticker: string }) {
  const [period, setPeriod] = useState("1y");
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/etfs/${ticker}/prices?period=${period}`
        );
        const json = await res.json();
        setData(
          (json.prices || []).map((p: { date: string; close: string | number }) => ({
            date: p.date,
            close: typeof p.close === "string" ? parseFloat(p.close) : p.close,
          }))
        );
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, [ticker, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Loading chart...
      </div>
    );
  }

  return <PriceChart data={data} period={period} onPeriodChange={setPeriod} />;
}
