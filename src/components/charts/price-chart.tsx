"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { CHART_PERIODS } from "@/lib/utils/constants";

interface PriceChartProps {
  data: { date: string; close: number; volume?: number }[];
  period: string;
  onPeriodChange: (period: string) => void;
  color?: string;
}

export function PriceChart({
  data,
  period,
  onPeriodChange,
  color = "hsl(var(--primary))",
}: PriceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No price data available
      </div>
    );
  }

  const firstPrice = data[0]?.close ?? 0;
  const lastPrice = data[data.length - 1]?.close ?? 0;
  const isPositive = lastPrice >= firstPrice;
  const chartColor = isPositive ? "#10b981" : "#ef4444";

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {CHART_PERIODS.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) =>
              new Date(d).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelFormatter={(d) =>
              new Date(d).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={chartColor}
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
