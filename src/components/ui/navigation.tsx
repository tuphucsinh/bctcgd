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

const FINANCIAL_QUOTES = [
  { text: "Đừng tiết kiệm những gì còn lại sau khi tiêu, hãy tiêu những gì còn lại sau khi tiết kiệm.", author: "Warren Buffett" },
  { text: "Giá cả là cái bạn trả, giá trị là cái bạn nhận được.", author: "Warren Buffett" },
  { text: "Đừng bao giờ kiểm tra độ sâu của dòng sông bằng cả hai chân.", author: "Warren Buffett" },
  { text: "Kỷ luật là cầu nối giữa mục tiêu và thành đạt.", author: "Jim Rohn" },
  { text: "Kẻ thù lớn nhất của kế hoạch tài chính là sự trì hoãn.", author: "Financial Hub" },
  { text: "Số tiền bạn kiếm được không quan trọng bằng số tiền bạn giữ được.", author: "Robert Kiyosaki" },
  { text: "Hãy mua khi mọi người sợ hãi và bán khi mọi người tham lam.", author: "Warren Buffett" },
  { text: "Tài sản là thứ mang tiền vào túi bạn, tiêu sản là thứ lấy tiền ra khỏi túi.", author: "Financial Hub" },
  { text: "Chi phí nhỏ sẽ tạo nên lỗ hổng lớn cho con thuyền tài chính.", author: "Benjamin Franklin" },
  { text: "Đầu tư vào kiến thức luôn mang lại lãi suất cao nhất.", author: "Benjamin Franklin" },
];

export function Navigation() {
  const pathname = usePathname();
  const isDetailsPage = pathname === "/transactions/details";
  
  if (isDetailsPage) return null;

  // Logic quote thay đổi theo ngày
  const today = new Date().getDate();
  const quoteIndex = today % FINANCIAL_QUOTES.length;
  const currentQuote = FINANCIAL_QUOTES[quoteIndex];

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

        <div className="mt-auto flex flex-col gap-6 pt-6 border-t border-white/5">
          {/* Financial Quote Widget */}
          <div className="px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group/quote">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/quote:opacity-20 transition-all duration-500">
              <BarChart3 className="h-8 w-8 rotate-12 group-hover/quote:rotate-0" />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground italic relative z-10 transition-colors group-hover/quote:text-white/70">
              &ldquo;{currentQuote.text}&rdquo;
              <span className="block mt-1 font-semibold not-italic text-[9px] uppercase tracking-tighter opacity-50">&mdash; {currentQuote.author}</span>
            </p>
          </div>

          {/* Minimalist Profile Display */}
          <div className="flex items-center gap-3 px-2 group cursor-pointer">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500/20 to-rose-500/20 p-[1px] group-hover:shadow-[0_0_15px_rgba(251,146,60,0.3)] transition-all">
                <div className="h-full w-full rounded-[9px] bg-[#050505] flex items-center justify-center font-bold text-xs text-white/90">
                  HL
                </div>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#050505]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">Hiếu & Ly</span>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[9px] text-orange-400 font-black uppercase tracking-widest">Premium</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-[9px] text-white/30 font-medium">Family Hub</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
