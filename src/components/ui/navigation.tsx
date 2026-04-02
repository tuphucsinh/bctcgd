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
      <aside className="hidden w-24 flex-col items-center border-r border-border/10 bg-card/30 py-8 backdrop-blur-xl md:flex h-screen sticky top-0 shrink-0">
        <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/20">
          <div className="h-6 w-6 rounded-full border-2 border-white/80 bg-white/20 backdrop-blur-sm" />
        </div>
        
        <nav className="flex w-full flex-1 flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex w-full flex-col items-center justify-center gap-1.5 p-3 text-xs font-medium transition-all duration-300 hover:text-foreground",
                  isActive ? "text-primary" : "text-muted-foreground opacity-60 hover:opacity-100"
                )}
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-transparent transition-all duration-300">
                  <Icon className={cn("relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110")} />
                  {isActive && (
                    <motion.div
                      layoutId="bubble-desktop"
                      className="absolute inset-0 z-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
                <span className={cn("transition-all duration-300", isActive ? "font-bold" : "")}>
                  {item.name}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="indicator-desktop"
                    className="absolute -right-[1px] top-1/4 h-1/2 w-1 rounded-l-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
