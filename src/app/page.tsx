"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { getFinancialSummary } from "@/lib/actions";

const users = [
  { id: "hieu", name: "Hiếu", color: "bg-blue-500" },
  { id: "ly", name: "Ly", color: "bg-pink-500" },
  { id: "joint", name: "Gia đình", color: "bg-indigo-500" }
];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("user") || "hieu";
  
  const [currentUser, setCurrentUser] = useState(users.find(u => u.id === userId) || users[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const summary = await getFinancialSummary(currentUser.id);
        setData(summary);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser.id]);

  const handleUserChange = (user: typeof users[0]) => {
    setCurrentUser(user);
    const params = new URLSearchParams(searchParams);
    params.set("user", user.id);
    router.push(`?${params.toString()}`);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'k';
  };

  return (
    <main className="w-full bg-background p-4 md:p-6 md:px-8">
      {/* Header bar with user switcher */}
      <header className="mb-6 flex items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border/50 bg-card/30 p-1 backdrop-blur-md">
            {users.slice(0, 2).map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserChange(user)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  currentUser.id === user.id
                    ? "bg-accent text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80 opacity-60"
                )}
              >
                <div className={cn("h-2.5 w-2.5 rounded-full transition-all duration-300", user.color, currentUser.id !== user.id && "scale-75 opacity-50")} />
                {user.name}
              </button>
            ))}
          </div>
          <TransactionModal currentUser={currentUser}>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" />
            </button>
          </TransactionModal>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-4 lg:grid-rows-5">
        {/* Total Net Worth */}
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
            {data && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Live
              </div>
            )}
          </div>
          <div className="relative z-10 mt-8 md:mt-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest opacity-70">Tài sản ròng</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              {loading ? "---" : formatMoney(data?.netWorth || 0)}
            </h2>
            <div className="mt-3">
              <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary border border-primary/20">
                {data?.cashFlow >= 0 ? "+" : ""}{formatMoney(data?.cashFlow || 0)} tháng này
              </span>
            </div>
          </div>
        </motion.div>

        {/* Expense Card */}
        <motion.div 
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 backdrop-blur-sm p-5 md:row-span-1"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
              <TrendingDown className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chi tiêu</span>
          </div>
          <div className="mt-3">
            <div className="text-xl lg:text-2xl font-bold italic tracking-tight">
              {loading ? "---" : formatMoney(data?.monthlySpending || 0)}
            </div>
          </div>
        </motion.div>

        {/* Income Card */}
        <motion.div 
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 backdrop-blur-sm p-5 md:row-span-1"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thu nhập</span>
          </div>
          <div className="mt-3">
            <div className="text-xl lg:text-2xl font-bold tracking-tight">
              {loading ? "---" : formatMoney(data?.monthlyIncome || 0)}
            </div>
          </div>
        </motion.div>

        {/* Action Link */}
        <motion.div 
          className="col-span-1 flex items-center justify-between rounded-3xl bg-primary/90 px-5 py-4 text-primary-foreground transition-all md:col-span-2 md:row-span-1"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 opacity-80" />
            <span className="text-sm font-semibold tracking-wide capitalize">Dữ liệu từ Supabase</span>
          </div>
          <ArrowUpRight className="h-4 w-4" />
        </motion.div>

        {/* Assets Allocation (Static UI for now) */}
        <motion.div 
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 backdrop-blur-sm p-6 md:col-span-2 md:row-span-2 lg:p-7"
        >
          <h3 className="mb-4 text-sm font-bold tracking-wide uppercase opacity-80 text-muted-foreground flex items-center gap-2">
             <PieChart className="h-3.5 w-3.5" /> Phân bổ tài sản
          </h3>
          <div className="text-2xl font-bold tracking-tighter">
            {loading ? "---" : formatMoney(data?.totalAssets || 0)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">Tổng giá trị các danh mục</p>
        </motion.div>

        {/* Debts info */}
        <motion.div 
          className="col-span-1 rounded-3xl border border-white/5 bg-card/80 p-5 md:row-span-1"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dư nợ</span>
          </div>
          <div className="mt-3 text-xl lg:text-2xl font-bold tracking-tight">
            {loading ? "---" : formatMoney(data?.totalDebts || 0)}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
