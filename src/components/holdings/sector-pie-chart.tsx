"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SECTOR_COLORS } from "@/lib/utils/constants";

interface SectorPieChartProps {
  sectors: { sector: string; weight: number }[];
}

export function SectorPieChart({ sectors }: SectorPieChartProps) {
  if (sectors.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        No sector data available
      </div>
    );
  }

  const data = sectors
    .filter((s) => s.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="weight"
          nameKey="sector"
          label={({ name, value }) =>
            Number(value) > 5 ? `${name} ${Number(value).toFixed(1)}%` : ""
          }
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell
              key={entry.sector}
              fill={SECTOR_COLORS[entry.sector] || SECTOR_COLORS.Other}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value) => [`${Number(value).toFixed(2)}%`, "Weight"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
