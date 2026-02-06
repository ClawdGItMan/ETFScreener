"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Plus, Trash2, ArrowRight } from "lucide-react";

interface WatchlistItem {
  ticker: string;
  addedAt: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [newTicker, setNewTicker] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("etf-watchlist");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const saveItems = (newItems: WatchlistItem[]) => {
    setItems(newItems);
    localStorage.setItem("etf-watchlist", JSON.stringify(newItems));
  };

  const addItem = () => {
    if (!newTicker) return;
    const ticker = newTicker.toUpperCase().trim();
    if (items.find((i) => i.ticker === ticker)) return;
    saveItems([...items, { ticker, addedAt: new Date().toISOString() }]);
    setNewTicker("");
  };

  const removeItem = (ticker: string) => {
    saveItems(items.filter((i) => i.ticker !== ticker));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground mt-1">
          Track your favorite ETFs. Data is saved in your browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Your ETFs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add ticker (e.g., IVV)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="max-w-[200px]"
            />
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Your watchlist is empty.</p>
              <p className="text-sm mt-1">
                Add ETF tickers above to start tracking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => (
                <div
                  key={item.ticker}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <Link
                    href={`/etf/${item.ticker}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Badge variant="outline" className="font-mono font-bold">
                      {item.ticker}
                    </Badge>
                    <ArrowRight className="h-3 w-3 opacity-50" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.ticker)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
