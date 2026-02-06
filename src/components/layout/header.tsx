"use client";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { EtfSearch } from "@/components/etf/etf-search";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <MobileNav />

        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="font-bold">ETF Tracker</span>
        </Link>

        <div className="flex-1 flex justify-center lg:justify-start">
          <EtfSearch />
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
