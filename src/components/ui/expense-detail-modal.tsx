"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getExpenseTransactions } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ExpenseDetailModalProps {
  children: React.ReactNode;
  currentUser: { id: string; name: string; color: string };
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  note: string;
  categories: {
    name: string;
    icon: string;
  } | null;
  owner?: string;
}

export function ExpenseDetailModal({ children, currentUser }: ExpenseDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeUserId, setActiveUserId] = useState(currentUser.id);

  // Đồng bộ activeUserId khi modal được mở ra dựa trên currentUser hiện tại của Dashboard
  useEffect(() => {
    if (open) {
      setActiveUserId(currentUser.id);
    }
  }, [open, currentUser.id]);

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await getExpenseTransactions(id);
      setTransactions(data as Transaction[] || []);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết chi tiêu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchData(activeUserId);
    }
  }, [open, activeUserId, fetchData]);

  const formatMoneyRaw = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent showCloseButton={false} className="sm:max-w-xl h-[95vh] bg-[#0a0a0a]/90 backdrop-blur-3xl border-white/10 shadow-2xl p-0 overflow-hidden rounded-3xl flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50" />
        
        <div className="px-4 pt-8 pb-4 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-50">
              <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-xs font-medium">Đang tải liệt kê...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-20 text-center space-y-2 opacity-40 italic">
              <p className="text-sm">Chưa có giao dịch chi tiêu nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {transactions.map((trx, idx) => (
                  <motion.div
                    key={trx.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative flex items-center gap-4 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[28px] h-full border-r border-white/5 pr-2.5">
                       <span className="text-sm font-black text-white/40 group-hover:text-orange-500/60 transition-colors">
                         {new Date(trx.date).getDate()}
                       </span>
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-3 overflow-hidden leading-tight">
                      <div className="flex items-center flex-1 gap-3 overflow-hidden">
                        <div className="w-20 flex-shrink-0">
                          <span className="font-semibold text-xs text-white truncate block">{trx.categories?.name || "Khác"}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <span className="text-[10px] text-muted-foreground truncate block">{trx.note || "—"}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-[82px] text-right">
                        <span className={cn(
                          "font-extrabold text-[11px]",
                          "text-orange-400"
                        )}>
                          {formatMoneyRaw(trx.amount)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#0a0a0a]/60 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-full bg-muted/40 backdrop-blur-md border border-white/5">
              {/* Badge Hiếu */}
              <button 
                onClick={() => setActiveUserId('hieu')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold relative overflow-hidden transition-all",
                  activeUserId === 'hieu' 
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20" 
                    : "text-white/15 hover:text-white/30"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full bg-blue-500 transition-all duration-500",
                  activeUserId === 'hieu' ? "shadow-[0_0_10px_currentColor] opacity-100" : "opacity-20"
                )} />
                Hiếu
              </button>
              
              {/* Badge Ly */}
              <button 
                onClick={() => setActiveUserId('ly')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold relative overflow-hidden transition-all",
                  activeUserId === 'ly' 
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20" 
                    : "text-white/15 hover:text-white/30"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full bg-pink-500 transition-all duration-500",
                  activeUserId === 'ly' ? "shadow-[0_0_10px_currentColor] opacity-100" : "opacity-20"
                )} />
                Ly
              </button>

              {/* Badge GĐ */}
              <button 
                onClick={() => setActiveUserId('all')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold relative overflow-hidden transition-all",
                  activeUserId === 'all' 
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20" 
                    : "text-white/15 hover:text-white/30"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full bg-amber-400 transition-all duration-500",
                  activeUserId === 'all' ? "shadow-[0_0_10px_currentColor] opacity-100" : "opacity-20"
                )} />
                GĐ
              </button>
            </div>
          </div>
          
           <button 
             onClick={() => setOpen(false)}
             className="px-6 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-white active:scale-95 shadow-inner border border-white/5"
           >
             Đóng
           </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
