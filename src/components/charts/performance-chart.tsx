"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

interface PerformanceChartProps {
  series: {
    ticker: string;
    data: { date: string; value: number }[];
  }[];
}

export function PerformanceChart({ series }: PerformanceChartProps) {
  if (series.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No performance data available
      </div>
    );
  }

  // Merge all series into a single dataset by date
  const dateMap = new Map<string, Record<string, number>>();
  series.forEach((s) => {
    s.data.forEach((d) => {
      const existing = dateMap.get(d.date) || { date: d.date as unknown as number };
      (existing as Record<string, number>)[s.ticker] = d.value;
      dateMap.set(d.date, existing);
    });
  });

  const merged = Array.from(dateMap.values()).sort((a, b) =>
    String((a as Record<string, unknown>).date ?? "").localeCompare(
      String((b as Record<string, unknown>).date ?? "")
    )
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={merged}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(d) =>
            new Date(d).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(v) => `${v.toFixed(0)}`}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
          formatter={(value, name) => [
            `${Number(value).toFixed(2)}`,
            String(name),
          ]}
        />
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.ticker}
            type="monotone"
            dataKey={s.ticker}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
