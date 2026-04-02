"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Wallet,
  CreditCard,
  BarChart3,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Tài sản", href: "/assets", icon: Wallet },
  { name: "Nợ", href: "/debts", icon: CreditCard },
  { name: "Báo cáo", href: "/reports", icon: BarChart3 },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border/10 bg-background/80 p-2 pb-safe backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <div className="relative mb-1 p-1">
                <Icon className={cn("h-5 w-5", isActive ? "opacity-100" : "opacity-60")} />
                {isActive && (
                  <motion.div
                    layoutId="bubble-mobile"
                    className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={cn("transition-all duration-200", isActive ? "scale-105 font-bold" : "scale-100 opacity-80")}>
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="indicator-mobile"
                  className="absolute -bottom-2 h-1 w-8 rounded-t-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Desktop Side Panel */}
      <aside className="hidden h-screen sticky top-0 shrink-0 border-r border-border/10 bg-card/30 backdrop-blur-xl md:flex w-64 flex-col p-6 transition-all duration-300">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <div className="h-5 w-5 rounded-full border-2 border-white/80 bg-white/20 backdrop-blur-sm" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            BCTCGD
          </span>
        </div>
        
        <nav className="flex w-full flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )} />
                <span className="flex-1">{item.name}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-pill-desktop"
                    className="absolute -left-1 h-6 w-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border/10 pt-6 px-2">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-3 ring-1 ring-border/5 transition-all hover:bg-muted/50 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-400 to-rose-400 p-[2px] transition-transform group-hover:scale-105">
              <div className="h-full w-full rounded-[10px] bg-background flex items-center justify-center font-bold text-xs">
                HL
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Hiếu & Ly</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Pro Account</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
