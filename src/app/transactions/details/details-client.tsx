"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getIncomeTransactions, getExpenseTransactions } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { TransactionModal } from "@/components/ui/transaction-modal";

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

export function TransactionDetailsClient({ initialUserId }: { initialUserId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" || "INCOME";

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeUserId, setActiveUserId] = useState(initialUserId.toLowerCase());

  const fetchData = useCallback(async (id: string, trxType: "INCOME" | "EXPENSE") => {
    setLoading(true);
    try {
      const data = trxType === "INCOME"
        ? await getIncomeTransactions(id)
        : await getExpenseTransactions(id);
      setTransactions(data as Transaction[] || []);
    } catch (err) {
      console.error(`Lỗi khi tải chi tiết ${trxType === "INCOME" ? "thu nhập" : "chi tiêu"}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveUserId(initialUserId.toLowerCase());
  }, [initialUserId]);

  useEffect(() => {
    fetchData(activeUserId, type);
  }, [activeUserId, type, fetchData]);

  const formatMoneyRaw = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isIncome = type === "INCOME";

  const UserSwitcher = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn(
      "flex p-0.5 rounded-full bg-white/[0.03] border border-white/[0.05] shadow-2xl",
      isMobile ? "p-1" : "p-0.5"
    )}>
      <button
        onClick={() => setActiveUserId('hieu')}
        className={cn(
          "flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-tight transition-all",
          activeUserId === 'hieu'
            ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
            : "text-white/20 hover:text-white/40"
        )}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full bg-blue-500", activeUserId === 'hieu' ? "opacity-100 shadow-[0_0_8px_#3b82f6]" : "opacity-20")} />
        Hiếu
      </button>

      <button
        onClick={() => setActiveUserId('ly')}
        className={cn(
          "flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-tight transition-all",
          activeUserId === 'ly'
            ? "bg-pink-500/10 text-pink-400 ring-1 ring-pink-500/20"
            : "text-white/20 hover:text-white/40"
        )}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full bg-pink-500", activeUserId === 'ly' ? "opacity-100 shadow-[0_0_8px_#ec4899]" : "opacity-20")} />
        Ly
      </button>

      <button
        onClick={() => setActiveUserId('all')}
        className={cn(
          "flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-tight transition-all",
          activeUserId === 'all'
            ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
            : "text-white/20 hover:text-white/40"
        )}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full bg-amber-500", activeUserId === 'all' ? "opacity-100 shadow-[0_0_8px_#f59e0b]" : "opacity-20")} />
        GĐ
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        {/* Header Profile - Ẩn trên Mobile, chỉ hiện trên PC */}
        <div className="hidden md:flex px-5 pt-8 pb-6 items-center justify-between relative z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-6">
              <div>
                <h1 className={cn(
                  "text-xl font-black italic tracking-tight leading-tight uppercase",
                  isIncome ? "text-emerald-500" : "text-orange-500"
                )}>
                  CHI TIẾT {isIncome ? "THU NHẬP" : "CHI TIÊU"}
                </h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  Lịch sử giao dịch tháng này
                </p>
              </div>

              {/* Nút + nhanh trên PC Header */}
              <TransactionModal currentUser={{ id: activeUserId, name: '' }} defaultType={type}>
                  <button className={cn(
                    "h-10 px-4 flex items-center gap-2 rounded-2xl shadow-2xl transition-all border cursor-pointer font-bold text-[10px] uppercase tracking-wider",
                    isIncome 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" 
                      : "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
                  )}>
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Thêm nhanh
                  </button>
              </TransactionModal>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* User Switcher trên PC - Di chuyển lên góc trên phải */}
             <div className="hidden md:block">
               <UserSwitcher />
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-5 pb-24 md:pb-12 overflow-y-auto custom-scrollbar relative pt-4 md:pt-0">
          <div>
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-50">
                <div className={cn("w-6 h-6 border-2 border-t-transparent rounded-full animate-spin", isIncome ? "border-emerald-500" : "border-orange-500")} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Đang tải...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center space-y-2 opacity-30 italic">
                <p className="text-sm font-medium">Chưa có giao dịch nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {(() => {
                    // Gom nhóm transactions theo ngày
                    const grouped = transactions.reduce((acc, trx) => {
                      if (!trx.date) return acc;
                      const dateObj = new Date(trx.date);
                      if (isNaN(dateObj.getTime())) return acc;

                      const dateStr = dateObj.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                      if (!acc[dateStr]) acc[dateStr] = [];
                      acc[dateStr].push(trx);
                      return acc;
                    }, {} as Record<string, Transaction[]>);

                    return Object.entries(grouped).map(([dateLabel, items], groupIdx) => (
                      <motion.div
                        key={dateLabel}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIdx * 0.05 }}
                        className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden divide-y divide-white/[0.02]"
                      >
                        {items.map((trx, idx) => (
                          <div
                            key={trx.id || idx}
                            className="group relative flex items-center gap-3 py-2 px-3 hover:bg-white/[0.04] transition-all"
                          >
                            {/* Cột Ngày - Theo phong cách cũ nhưng ẩn nếu lặp lại */}
                            <div className="flex flex-col items-center justify-center min-w-[32px] border-r border-white/5 pr-3">
                              {idx === 0 ? (
                                <span className={cn("md:text-sm text-[11px] font-black italic transition-colors", isIncome ? "text-emerald-500/60" : "text-orange-500/60")}>
                                  {new Date(trx.date).getDate()}
                                </span>
                              ) : (
                                <div className="h-5 w-5" /> /* Giữ chỗ để thẳng hàng */
                              )}
                            </div>

                            <div className="flex-1 flex items-center gap-3 overflow-hidden">
                              {/* Cột Danh mục */}
                              <div className="w-[100px] md:w-[140px] flex-shrink-0 flex flex-col">
                                <span className="font-bold md:text-xs text-[11px] text-white truncate block uppercase tracking-wide">
                                  {trx.categories?.name || "Khác"}
                                </span>
                                {activeUserId === 'all' && trx.owner && (
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-tighter opacity-70",
                                    isIncome ? "mt-0" : "mt-0.5",
                                    trx.owner === 'HIEU' ? "text-blue-400" : "text-pink-400"
                                  )}>
                                    {trx.owner === 'HIEU' ? "Hiếu" : "Ly"}
                                  </span>
                                )}
                              </div>

                              {/* Cột Số tiền - Căn giữa số tiền */}
                              <div className="w-[85px] md:w-[110px] flex-shrink-0 flex items-center justify-center pr-4 border-r border-white/5">
                                <span className={cn(
                                  "font-black text-xs italic tracking-tight",
                                  isIncome ? "text-emerald-400" : "text-orange-400"
                                )}>
                                  {formatMoneyRaw(trx.amount)}
                                </span>
                              </div>

                              {/* Cột Ghi chú (Note) */}
                              <div className="flex-1 overflow-hidden">
                                <span className="text-[10px] text-white/30 truncate block font-medium group-hover:text-white/50 transition-colors">
                                  {trx.note || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ));
                  })()}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bottom Bar - Cố định ở dưới cùng, ẩn trên PC */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4">
        {/* User Switcher & Add Button - Menu này chỉ hiện trên Mobile */}
        {/* User Switcher - Menu này chỉ hiện trên Mobile */}
        <div className={cn(
          "bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 p-1.5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-1",
        )}>
          {/* Mobile Switcher */}
          <UserSwitcher isMobile />
        </div>

        {/* Mobile-only Quick Add & Back */}
        <div className="flex items-center gap-2">
          <TransactionModal currentUser={{ id: activeUserId, name: '' }} defaultType={type}>
            <button className={cn(
              "h-12 w-12 flex items-center justify-center rounded-2xl shadow-2xl active:scale-90 transition-all border",
              isIncome ? "bg-emerald-500 text-white border-emerald-400" : "bg-orange-500 text-white border-orange-400"
            )}>
              <Plus className="h-6 w-6 stroke-[3]" />
            </button>
          </TransactionModal>
          
          <button
            onClick={() => router.push('/')}
            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 text-white/50 active:scale-90 transition-all shadow-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
