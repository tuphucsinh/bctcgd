"use client";

import { motion } from "framer-motion";
import { Banknote, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedNumber, SpotlightCard, MagneticButton } from "@/components/ui/dashboard-cards";
import { TransactionModal } from "@/components/ui/transaction-modal";
import { CashUpdateModal } from "@/components/ui/cash-update-modal";
import { cn } from "@/lib/utils";

interface MetricsRowProps {
  currentUser: { id: string; name: string; color: string };
  loading: boolean;
  cash: number;
  income: number;
  expense: number;
  goals: { income: number; expense: number };
}

export function MetricsRow({ currentUser, loading, cash, income, expense, goals }: MetricsRowProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Cash Card */}
      <SpotlightCard 
        color="rgba(59,130,246,0.15)"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-blue-500/10 bg-[#0a0a0a]/60 shadow-xl"
      >
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.05] pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-blue-400">
            <path d="M0,15 C10,14 20,16 35,12 C50,8 65,15 80,10 C90,7 95,8 100,6 L100,20 L0,20 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between relative z-20">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [-2, 2, -2] }}
                className="rounded-xl bg-blue-500/10 p-2 text-blue-400 backdrop-blur-md border border-blue-500/20"
              >
                <Banknote className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white/70">
                {loading ? "---" : <AnimatedNumber value={cash} />}
              </h2>
            </div>
          </div>
          <div 
            className="absolute top-1.5 right-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <CashUpdateModal currentCash={cash} userId={currentUser?.id}>
              <MagneticButton>
                <button 
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-sm border border-blue-500/20"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </CashUpdateModal>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Tiền mặt</span>
          </div>
        </div>
      </SpotlightCard>

      {/* Income Card */}
      <SpotlightCard
        onClick={() => router.push(`/transactions/details?type=INCOME&user=all`)}
        color="rgba(16,185,129,0.15)"
        className="rounded-3xl border border-emerald-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.08] pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-emerald-400">
            <path d="M0,18 C15,17 30,14 45,10 C60,6 75,8 90,2 C95,0 98,1 100,0 L100,20 L0,20 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between relative z-20">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 backdrop-blur-md border border-emerald-500/20"
              >
                <TrendingUp className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                {loading ? "---" : <AnimatedNumber value={income} />}
              </h2>
            </div>
          </div>
          <div 
            className="absolute top-1.5 right-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <TransactionModal currentUser={currentUser} defaultType="INCOME">
              <MagneticButton>
                <button 
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm border border-emerald-500/20"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </TransactionModal>
          </div>
          <div className="flex items-center justify-between mt-4 relative z-20 px-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5 shadow-sm">Thu nhập</span>
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
              Mục tiêu: {goals.income / 1000000} triệu
            </span>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 overflow-hidden rounded-b-3xl">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((income / goals.income) * 100, 100)}%` }}
            className="h-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
          />
        </div>
      </SpotlightCard>

      {/* Expense Card */}
      <SpotlightCard
        onClick={() => router.push(`/transactions/details?type=EXPENSE&user=all`)}
        color="rgba(249,115,22,0.15)"
        className="rounded-3xl border border-orange-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.08] pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-orange-400">
            <path d="M0,2 C15,3 30,6 45,10 C60,14 75,12 90,17 C95,19 98,19 100,20 L100,20 L0,20 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between relative z-20">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="rounded-xl bg-orange-500/10 p-2 text-orange-400 backdrop-blur-md border border-orange-500/20"
              >
                <TrendingDown className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                {loading ? "---" : <AnimatedNumber value={expense} />}
              </h2>
            </div>
          </div>
          <div 
            className="absolute top-1.5 right-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <TransactionModal currentUser={currentUser} defaultType="EXPENSE">
              <MagneticButton>
                <button 
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-sm border border-orange-500/20"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </TransactionModal>
          </div>
          <div className="flex items-center justify-between mt-4 relative z-20 px-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5 shadow-sm">Chi tiêu</span>
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
              Ngân sách: {goals.expense / 1000000} triệu
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 overflow-hidden rounded-b-3xl">
          {(() => {
            const spent = expense;
            const limit = goals.expense;
            const percentage = Math.min((spent / limit) * 100, 100);
            const isOver90 = percentage > 90;
            const color = isOver90 
              ? "bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.95)]" 
              : percentage > 70 
                ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]" 
                : "bg-yellow-200/80 shadow-[0_0_12px_rgba(254,240,138,0.4)]";
            return (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ 
                  width: `${percentage}%`,
                  opacity: isOver90 ? [1, 0.4, 1] : 1,
                  scaleY: isOver90 ? [1, 1.25, 1] : 1
                }}
                transition={{
                  width: { duration: 0.8 },
                  opacity: isOver90 ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {},
                  scaleY: isOver90 ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {}
                }}
                className={cn("h-full origin-bottom transition-colors duration-500", color)}
              />
            );
          })()}
        </div>
      </SpotlightCard>
    </div>
  );
}
