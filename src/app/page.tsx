"use client";

import { useState } from "react";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  PieChart, 
  ArrowUpRight
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

  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
      {/* Header bar with user switcher */}
      <header className="mb-6 flex items-center justify-end gap-3">
        <div />

        <div className="flex items-center gap-2">
          {/* User Switcher Toggle */}
          <div className="flex items-center gap-1 rounded-full border border-border/50 bg-card/30 p-1 backdrop-blur-md">
            {users.slice(0, 2).map((user) => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  currentUser.id === user.id
                    ? "bg-accent text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80 opacity-60"
                )}
              >
                <div 
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition-all duration-300", 
                    user.color,
                    currentUser.id !== user.id && "scale-75 opacity-50"
                  )} 
                />
                {user.name}
              </button>
            ))}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-4 lg:grid-rows-5">
        
        {/* Total Assets - Large center highlight */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 flex flex-col justify-between rounded-3xl border border-white/5 bg-gradient-to-br from-card to-card/50 p-6 shadow-2xl md:col-span-2 md:row-span-2 lg:p-7 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors duration-700" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="h-10 w-10 rounded-xl bg-primary/10 p-2.5 text-primary backdrop-blur-md">
              <TrendingUp className="h-full w-full" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              + 12%
            </div>
          </div>
          <div className="relative z-10 mt-8 md:mt-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest opacity-70">Tổng tài sản ròng</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              1.450.000k
            </h2>
            <div className="mt-3">
              <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary border border-primary/20">
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
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 backdrop-blur-sm p-5 hover:bg-accent/40 transition-colors md:row-span-1"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
              <TrendingDown className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chi tiêu</span>
          </div>
          <div className="mt-3">
            <div className="text-xl lg:text-2xl font-bold italic tracking-tight">42.500k</div>
            <p className="mt-1 text-[10px] text-muted-foreground/80 font-medium">Cao hơn 15%</p>
          </div>
        </motion.div>

        {/* Income Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 backdrop-blur-sm p-5 hover:bg-accent/40 transition-colors md:row-span-1"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thu nhập</span>
          </div>
          <div className="mt-3">
            <div className="text-xl lg:text-2xl font-bold tracking-tight">120.000k</div>
            <p className="mt-1 text-[10px] text-emerald-400/80 font-semibold uppercase">Lương & Cổ tức</p>
          </div>
        </motion.div>

        {/* Quick Action Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 flex items-center justify-between rounded-3xl bg-primary/90 hover:bg-primary px-5 py-4 text-primary-foreground transition-all cursor-pointer group shadow-lg shadow-primary/20 md:col-span-2 md:row-span-1"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 opacity-80" />
            <span className="text-sm font-semibold tracking-wide capitalize">Thanh toán nợ vay tháng 4</span>
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
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 backdrop-blur-sm p-6 md:col-span-2 md:row-span-2 lg:p-7"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide uppercase opacity-80 text-muted-foreground flex items-center gap-2">
               <PieChart className="h-3.5 w-3.5" /> Phân bổ nguồn vốn
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Bất động sản", amount: "1.200k", percentage: 82, color: "bg-blue-500" },
              { label: "Chứng khoán", amount: "180k", percentage: 12, color: "bg-emerald-400" },
              { label: "Tiền mặt", amount: "70k", percentage: 6, color: "bg-orange-400" },
            ].map((item) => (
              <div key={item.label} className="group cursor-pointer">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">{item.label}</span>
                  <span className="font-bold text-foreground/90">{item.amount}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent/50 box-border">
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
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 p-5 md:row-span-1"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dư nợ gốc</span>
          </div>
          <div className="mt-3">
            <div className="text-xl lg:text-2xl font-bold tracking-tight">500k</div>
            <p className="mt-1 text-[10px] text-muted-foreground/70">BIDV mua nhà</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 p-5 md:row-span-1"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lãi tháng</span>
          </div>
          <div className="mt-3">
            <div className="text-xl lg:text-2xl font-bold tracking-tight">3.5k</div>
            <p className="mt-1 text-[10px] text-rose-400/80 font-bold uppercase">3.5% / Năm</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
