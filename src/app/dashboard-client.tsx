'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFinancialSummary, getRecentTransactions, getMonthlyTrend } from "@/lib/actions";

import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { ComparisonBars } from "@/components/dashboard/ComparisonBars";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";

const users = [
  { id: "hieu", name: "Hiếu", color: "bg-blue-500" },
  { id: "ly", name: "Ly", color: "bg-pink-500" }
];

const MOCK_TREND_DATA = [
  { date: "01/04", income: 500000, expense: 200000 },
  { date: "05/04", income: 1500000, expense: 800000 },
  { date: "10/04", income: 700000, expense: 1200000 },
  { date: "15/04", income: 2500000, expense: 1500000 },
  { date: "20/04", income: 1800000, expense: 2200000 },
  { date: "25/04", income: 3000000, expense: 1900000 },
  { date: "30/04", income: 2700000, expense: 2500000 },
];

interface DashboardClientProps {
  initialSummary: any;
  initialTrend: any[];
}

export function DashboardClient({ initialSummary, initialTrend }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("user") || "hieu";
  
  const [currentUser, setCurrentUser] = useState(users.find(u => u.id === userId) || users[0]);
  const [data, setData] = useState<any>(initialSummary);
  const [trendData, setTrendData] = useState<any[]>(initialTrend);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // P1-1: Fetch data theo user đang chọn
    async function refreshData() {
      setLoading(true);
      try {
        const [summary, , trend] = await Promise.all([
          getFinancialSummary(userId),
          getRecentTransactions(userId, 5),
          getMonthlyTrend(userId)
        ]);
        setData(summary);
        setTrendData(trend || []);
      } catch (err) {
        console.error("Error refreshing dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    refreshData();
  }, [userId]); // Re-fetch mỗi khi user thay đổi

  const handleUserChange = (user: typeof users[0]) => {
    setCurrentUser(user);
    const params = new URLSearchParams(searchParams);
    params.set("user", user.id);
    router.push(`?${params.toString()}`);
  };

  const realIncome = data?.monthlyIncome ?? 0;
  const realExpense = data?.monthlySpending ?? 0;
  
  const income = realIncome > 0 ? realIncome : (trendData.length === 0 && !data ? 0 : realIncome);
  const expense = realExpense > 0 ? realExpense : (trendData.length === 0 && !data ? 0 : realExpense); 
  const cash = data?.totalCash ?? 0;

  const totalFlow = income + expense;
  const incomePercent = totalFlow > 0 ? (income / totalFlow) * 100 : 0;
  const expensePercent = totalFlow > 0 ? (expense / totalFlow) * 100 : 0;

  return (
    <main className="w-full bg-background p-4 md:p-6 md:px-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
      <header className="flex items-center justify-between mb-2">
        <div className="flex flex-col items-start gap-1 group cursor-default">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/10 relative overflow-hidden transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white tracking-tight">
              <span className="px-0.5">04</span>
              <span className="h-2.5 w-[1px] bg-white/20" />
              <span className="text-white/60 px-0.5">2026</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-full bg-muted/40 backdrop-blur-md border border-white/5">
            {users.map((u) => {
                const isActive = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleUserChange(u)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all text-xs font-semibold relative overflow-hidden",
                      isActive 
                        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20" 
                        : "text-white/15 hover:text-white/40 hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      u.color,
                      isActive ? "shadow-[0_0_10px_currentColor]" : "opacity-20"
                    )} />
                    {u.name}
                  </button>
                );
              })}
          </div>
        </div>
      </header>

      {data?.hasError && (
        <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-200 border bg-red-500/10 border-red-500/20 rounded-2xl">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>Lỗi đồng bộ dữ liệu. Kết nối máy chủ bị gián đoạn, một số chỉ số (ví dụ: Thu nhập / Chi phí) đang hiển thị 0 VND.</p>
        </div>
      )}

      <MetricsRow 
        currentUser={currentUser}
        loading={loading}
        cash={cash}
        income={income}
        expense={expense}
        goals={{
          income: data?.targetIncome || 35000000,
          expense: data?.targetSpending || 22000000
        }}
      />

      <div className="flex flex-col gap-8 mb-12 mt-4">
        <ComparisonBars 
          income={income} 
          expense={expense} 
        />

        <MonthlyTrendChart 
          trendData={trendData.length > 0 ? trendData : (isMounted ? MOCK_TREND_DATA : [])}
          loading={loading}
          isMounted={isMounted}
          cashFlow={data?.cashFlow ?? 0}
          incomePercent={incomePercent}
          expensePercent={expensePercent}
        />
      </div>
    </main>
  );
}
