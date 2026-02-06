"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg leading-none">ETF Tracker</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                BlackRock & Beyond
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(
                    item.href.split("/").slice(0, 2).join("/")
                  );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
