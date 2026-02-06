"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color,
  width = 80,
  height = 30,
}: SparklineProps) {
  if (data.length < 2) return null;

  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color || (isPositive ? "#10b981" : "#ef4444");
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
