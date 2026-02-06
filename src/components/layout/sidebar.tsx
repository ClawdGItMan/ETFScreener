"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  GitCompare,
  Flame,
  Newspaper,
  Search,
  Bookmark,
  PieChart,
  Layers,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/screener", label: "Screener", icon: Search },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/hot-cold", label: "Hot & Cold", icon: Flame },
  { href: "/news", label: "News Feed", icon: Newspaper },
  { href: "/overlap", label: "Overlap", icon: Layers },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card min-h-screen">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-bold text-lg leading-none">ETF Tracker</h1>
            <p className="text-xs text-muted-foreground mt-0.5">BlackRock & Beyond</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium">Data Sources</p>
          <p className="text-xs text-muted-foreground mt-1">
            FMP API, iShares, Marketaux
          </p>
        </div>
      </div>
    </aside>
  );
}
