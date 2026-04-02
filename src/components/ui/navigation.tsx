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
      {/* Mobile Bottom Navigation (Floating Pill Island) */}
      <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+8px)] left-4 right-4 z-50 flex items-center justify-around rounded-full border border-white/10 bg-[#0a0a0a]/60 p-1.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors duration-300 rounded-full w-16",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20 shadow-inner"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className="relative mb-0.5 z-10">
                <Icon className={cn("h-5 w-5 transition-transform", isActive ? "scale-105" : "scale-100 opacity-70")} />
              </div>
              <span className={cn("transition-all duration-200 z-10", isActive ? "font-bold" : "opacity-80")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Side Panel (VisionOS Glass) */}
      <aside className="hidden h-screen sticky top-0 shrink-0 border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl md:flex w-64 flex-col p-6 transition-all duration-300">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <BarChart3 className="h-5 w-5 text-white" />
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
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:translate-x-1 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="desktop-nav-indicator"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110 relative z-10",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )} />
                <span className="flex-1 relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 px-2">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5 transition-all hover:bg-white/[0.06] hover:ring-white/10 cursor-pointer group shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-400 to-rose-400 p-[2px] transition-transform group-hover:scale-105">
              <div className="h-full w-full rounded-[10px] bg-[#0a0a0a] flex items-center justify-center font-bold text-xs text-white">
                HL
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Hiếu & Ly</span>
              <span className="text-[10px] text-primary/80 uppercase tracking-widest font-bold">Pro Account</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
