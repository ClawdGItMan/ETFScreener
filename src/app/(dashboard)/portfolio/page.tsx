"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { computeExpenseSavings } from "@/lib/utils/calculations";
import { Plus, Trash2, PieChart as PieIcon, Calculator } from "lucide-react";

interface Allocation {
  ticker: string;
  weight: number;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

export default function PortfolioPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([
    { ticker: "IVV", weight: 40 },
    { ticker: "IEFA", weight: 20 },
    { ticker: "AGG", weight: 20 },
    { ticker: "IEMG", weight: 10 },
    { ticker: "IWM", weight: 10 },
  ]);
  const [newTicker, setNewTicker] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState(100000);

  const totalWeight = allocations.reduce((sum, a) => sum + a.weight, 0);

  const addAllocation = () => {
    if (!newTicker || allocations.find((a) => a.ticker === newTicker.toUpperCase())) return;
    setAllocations([...allocations, { ticker: newTicker.toUpperCase(), weight: 0 }]);
    setNewTicker("");
  };

  const removeAllocation = (ticker: string) => {
    setAllocations(allocations.filter((a) => a.ticker !== ticker));
  };

  const updateWeight = (ticker: string, weight: number) => {
    setAllocations(
      allocations.map((a) => (a.ticker === ticker ? { ...a, weight } : a))
    );
  };

  const pieData = allocations
    .filter((a) => a.weight > 0)
    .map((a) => ({ name: a.ticker, value: a.weight }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Builder</h1>
        <p className="text-muted-foreground mt-1">
          Build and analyze a virtual ETF portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Builder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5" />
              Allocations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add ticker (e.g., QQQ)"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAllocation()}
                  className="max-w-[200px]"
                />
                <Button onClick={addAllocation} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ETF</TableHead>
                    <TableHead className="w-[200px]">Weight (%)</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((a) => (
                    <TableRow key={a.ticker}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {a.ticker}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={a.weight}
                            onChange={(e) =>
                              updateWeight(a.ticker, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 h-8"
                          />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${a.weight}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        ${((investmentAmount * a.weight) / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAllocation(a.ticker)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Total Weight</span>
                <span
                  className={`font-bold ${
                    totalWeight === 100 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {totalWeight}%
                  {totalWeight !== 100 && " (must equal 100%)"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground">
                Investment Amount
              </label>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) =>
                  setInvestmentAmount(parseFloat(e.target.value) || 0)
                }
                className="mt-1"
              />
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value}%`, "Weight"]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span>
                    {d.name} ({d.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Expense Ratio Savings Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Compare the cost of two ETFs tracking the same index over time.
            For example, IVV (0.03%) vs SPY (0.09%) on a $100,000 investment
            with an assumed 8% annual return.
          </p>
          <ExpenseCalculator />
        </CardContent>
      </Card>
    </div>
  );
}

function ExpenseCalculator() {
  const [amount, setAmount] = useState(100000);
  const erA = 0.0003; // IVV
  const erB = 0.0009; // SPY

  const { yearlyData } = computeExpenseSavings(amount, 30, erA, erB);

  const milestones = [1, 5, 10, 20, 30];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead className="text-right">IVV (0.03%)</TableHead>
            <TableHead className="text-right">SPY (0.09%)</TableHead>
            <TableHead className="text-right">Savings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones.map((yr) => {
            const row = yearlyData[yr - 1];
            if (!row) return null;
            return (
              <TableRow key={yr}>
                <TableCell className="font-medium">{yr}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ${row.valueA.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  ${row.valueB.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-600 font-medium">
                  ${row.savings.toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
