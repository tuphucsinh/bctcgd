"use client";

import { useState } from "react";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  PieChart, 
  ArrowUpRight,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TransactionModal } from "@/components/ui/transaction-modal";

const users = [
  { id: "hieu", name: "Hiếu", color: "bg-blue-500" },
  { id: "ly", name: "Ly", color: "bg-pink-500" },
  { id: "joint", name: "Gia đình", color: "bg-indigo-500" }
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState(users[0]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
      {/* Header bar with user switcher */}
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tổng quan</h1>
          <p className="text-muted-foreground">Xin chào, {currentUser.name}! Báo cáo tài chính tháng 4/2026.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* User Switcher Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm transition-all hover:bg-accent backdrop-blur-md"
            >
              <div className={cn("h-4 w-4 rounded-full", currentUser.color)} />
              <span className="font-medium text-foreground">{currentUser.name}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isUserMenuOpen && "rotate-180")} />
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-2 min-w-[160px] overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
                {users.map((user) => (
                  <button
                    key={user.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                    onClick={() => {
                      setCurrentUser(user);
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <div className={cn("h-3 w-3 rounded-full", user.color)} />
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Main Action Button -> Opens Transaction Modal */}
          <TransactionModal currentUser={currentUser}>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" />
            </button>
          </TransactionModal>
        </div>
      </header>

      {/* Bento Grid layout continues here... */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-6 lg:gap-6">
        
        {/* Total Assets - Large center highlight */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 flex flex-col justify-between rounded-[2rem] border border-white/5 bg-gradient-to-br from-card to-card/50 p-6 shadow-2xl md:col-span-2 md:row-span-3 lg:p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors duration-700" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 p-3 text-primary backdrop-blur-md">
              <TrendingUp className="h-full w-full" />
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
              <Plus className="h-3 w-3" /> 12%
            </div>
          </div>
          <div className="relative z-10 mt-12 md:mt-0">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tổng tài sản ròng</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              1.450.000k
            </h2>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                +150.000k tháng này
              </span>
            </div>
          </div>
        </motion.div>

        {/* Expense Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 rounded-[2rem] border border-white/5 bg-card/80 backdrop-blur-sm p-6 hover:bg-accent/40 transition-colors md:row-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Chi tiêu</span>
          </div>
          <div className="mt-4 lg:mt-6">
            <div className="text-2xl lg:text-3xl font-bold">42.500k</div>
            <p className="mt-1.5 text-xs text-muted-foreground font-medium">Báo động: Cao hơn 15%</p>
          </div>
        </motion.div>

        {/* Income Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 rounded-[2rem] border border-white/5 bg-card/80 backdrop-blur-sm p-6 hover:bg-accent/40 transition-colors md:row-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Thu nhập</span>
          </div>
          <div className="mt-4 lg:mt-6">
            <div className="text-2xl lg:text-3xl font-bold">120.000k</div>
            <p className="mt-1.5 text-xs text-muted-foreground font-medium">Từ Lương & Cổ tức</p>
          </div>
        </motion.div>

        {/* Quick Action Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 flex items-center justify-between rounded-[2rem] bg-primary/90 hover:bg-primary p-6 text-primary-foreground transition-all cursor-pointer group shadow-lg shadow-primary/20 md:col-span-2 md:row-span-1"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 opacity-80" />
            <span className="font-semibold tracking-wide">Thanh toán nợ vay tháng 4</span>
          </div>
          <div className="rounded-full bg-black/20 p-2 group-hover:bg-black/40 transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </motion.div>

        {/* Assets Allocation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 rounded-[2rem] border border-white/5 bg-card/80 backdrop-blur-sm p-6 md:col-span-2 md:row-span-3 lg:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold tracking-wide">Phân bổ nguồn vốn</h3>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-5">
            {[
              { label: "Bất động sản", amount: "1.200.000k", percentage: 82, color: "bg-blue-500" },
              { label: "Cổ phiếu & Trái phiếu", amount: "180.000k", percentage: 12, color: "bg-emerald-400" },
              { label: "Tiền mặt & Tiết kiệm", amount: "70.000k", percentage: 6, color: "bg-orange-400" },
            ].map((item) => (
              <div key={item.label} className="group cursor-pointer">
                <div className="mb-2.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{item.label}</span>
                  <span className="font-bold text-foreground/90">{item.amount}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-accent/50 box-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Debts info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 rounded-[2rem] border border-white/5 bg-card/80 p-6 md:row-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Dư nợ gốc</span>
          </div>
          <div className="mt-4 lg:mt-6">
            <div className="text-2xl lg:text-3xl font-bold">500.000k</div>
            <p className="mt-1.5 text-xs text-muted-foreground font-medium">Vay mua nhà BIDV</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-1 rounded-[2rem] border border-white/5 bg-card/80 p-6 md:row-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tiền lãi tháng</span>
          </div>
          <div className="mt-4 lg:mt-6">
            <div className="text-2xl lg:text-3xl font-bold">3.500k</div>
            <p className="mt-1.5 text-xs text-muted-foreground font-medium">Lãi suất tb 3.5%/năm</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
