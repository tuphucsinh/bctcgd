"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

interface ComparisonBarsProps {
  income: number;
  expense: number;
}

export function ComparisonBars({ income, expense }: ComparisonBarsProps) {
  const totalFlow = income + expense;
  const incomePercent = totalFlow > 0 ? (income / totalFlow) * 100 : 0;
  const expensePercent = totalFlow > 0 ? (expense / totalFlow) * 100 : 0;

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  const isDeficit = expense > income;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isDeficit 
          ? "0 10px 40px rgba(249,115,22,0.25)" 
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        borderColor: isDeficit 
          ? "rgba(249,115,22,0.3)" 
          : "rgba(255,255,255,0.05)"
      }}
      transition={{ 
        opacity: { duration: 0.5, delay: 0.35 },
        y: { duration: 0.5, delay: 0.35 },
        boxShadow: { duration: 0.3 },
        borderColor: { duration: 0.3 }
      }}
      className={cn(
        "relative rounded-3xl border bg-card/40 p-5 backdrop-blur-md transition-all duration-300",
        isDeficit ? "border-orange-500/30 shadow-none" : "border-white/5"
      )}
    >
      <div className="absolute top-4 right-5">
         <motion.div 
           className={cn(
             "px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight border backdrop-blur-md",
             savingsRate >= 0 
               ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
               : "bg-orange-500/10 text-orange-400 border-orange-500/20"
           )}
         >
           {savingsRate >= 0 ? `TIẾT KIỆM: ${savingsRate.toFixed(0)}%` : `THÂM HỤT: ${Math.abs(savingsRate).toFixed(0)}%`}
         </motion.div>
      </div>

      <div className="space-y-4">
        {/* Income Bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-3 px-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">Thu nhập</span>
            <span className="text-xs font-bold text-emerald-400">{formatCurrency(income)}</span>
          </div>
          <div className="h-2 w-full bg-emerald-500/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${incomePercent}%` }}
               transition={{ width: { duration: 1, delay: 0.5 } }}
               className="h-full origin-bottom bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
             />
          </div>
        </div>

        {/* Expense Bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-3 px-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">Chi tiêu</span>
            <span className={cn("text-xs font-bold", isDeficit ? "text-orange-500" : "text-orange-400")}>
              {formatCurrency(expense)}
            </span>
          </div>
          <div className="h-2 w-full bg-orange-500/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${expensePercent}%` }}
               transition={{ width: { duration: 1, delay: 0.7 } }}
               className="h-full origin-bottom bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
             />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
