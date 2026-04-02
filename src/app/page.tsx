"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Banknote,
  Activity,
  ListOrdered
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { TransactionModal } from "@/components/ui/transaction-modal";
import { getFinancialSummary, getRecentTransactions, getMonthlyTrend } from "@/lib/actions";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const users = [
  { id: "hieu", name: "Hiếu", color: "bg-blue-500" },
  { id: "ly", name: "Ly", color: "bg-pink-500" }
];

const GOALS = {
  hieu: { income: 20000000, expense: 12000000 },
  ly: { income: 15000000, expense: 10000000 }
};

const MOCK_TREND_DATA = [
  { date: "01/04", income: 500000, expense: 200000 },
  { date: "05/04", income: 1500000, expense: 800000 },
  { date: "10/04", income: 700000, expense: 1200000 },
  { date: "15/04", income: 2500000, expense: 1500000 },
  { date: "20/04", income: 1800000, expense: 2200000 },
  { date: "25/04", income: 3000000, expense: 1900000 },
  { date: "30/04", income: 2700000, expense: 2500000 },
];

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.floor(latest));
  });

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

function SpotlightCard({ children, className, color = "rgba(255,255,255,0.05)", ...props }: React.ComponentPropsWithoutRef<typeof motion.div> & { color?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [7, -7]), { stiffness: 150, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-7, 7]), { stiffness: 150, damping: 25 });

  // Parallax: Nội dung di chuyển lệch pha để tạo chiều sâu
  const tx = useSpring(useTransform(mouseX, [-200, 200], [-6, 6]), { stiffness: 150, damping: 25 });
  const ty = useSpring(useTransform(mouseY, [-200, 200], [-6, 6]), { stiffness: 150, damping: 25 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - (left + width / 2));
    mouseY.set(clientY - (top + height / 2));
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative group bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden transform-gpu transition-all duration-300 hover:border-white/20", className)}
      style={{ rotateX, rotateY, perspective: 1200 }}
      {...props}
    >
      {/* Glass Noise Surface */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay scale-[2]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Spotlight Effect Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-60"
        style={{
          background: useTransform(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [mouseX, mouseY] as any,
            ([x, y]: [number, number]) => `radial-gradient(450px circle at ${x + 250}px ${y + 150}px, ${color}, transparent)`
          ),
        }}
      />
      
      {/* Parallax Content Layer */}
      <motion.div style={{ x: tx as unknown as number, y: ty as unknown as number }} className="relative z-10 w-full h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

function MagneticButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Magnetic pull to mouse - subtle distance factor
    x.set((clientX - centerX) * 0.4);
    y.set((clientY - centerY) * 0.4);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn("relative z-30 transition-shadow p-6 -m-6", className)}
    >
      {children}
    </motion.div>
  );
}


function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("user") || "hieu";
  
  const [currentUser, setCurrentUser] = useState(users.find(u => u.id === userId) || users[0]);
  const [data, setData] = useState<Awaited<ReturnType<typeof getFinancialSummary>> | null>(null);
  const [recentTrx, setRecentTrx] = useState<Awaited<ReturnType<typeof getRecentTransactions>>>([]);
  const [trendData, setTrendData] = useState<Awaited<ReturnType<typeof getMonthlyTrend>>>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      setLoading(true);
      try {
        const [summary, transactions, trend] = await Promise.all([
          getFinancialSummary(currentUser.id),
          getRecentTransactions(currentUser.id, 5),
          getMonthlyTrend(currentUser.id)
        ]);
        setData(summary);
        setRecentTrx(transactions || []);
        setTrendData(trend || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleUserChange = (user: typeof users[0]) => {
    setCurrentUser(user);
    const params = new URLSearchParams(searchParams);
    params.set("user", user.id);
    router.push(`?${params.toString()}`);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const realIncome = data?.monthlyIncome ?? 0;
  const realExpense = data?.monthlySpending ?? 0;
  
  // Dùng dữ liệu thật nếu có, không thì dùng mẫu để demo
  const income = realIncome > 0 ? realIncome : (trendData.length === 0 ? 11000000 : 0);
  const expense = realExpense > 0 ? realExpense : (trendData.length === 0 ? 11500000 : 0); 
  const cash = (data?.totalAssets ?? 0) > 0 ? (data?.totalAssets ?? 0) : (trendData.length === 0 ? 45000000 : 0);

  const totalFlow = income + expense;
  const incomePercent = totalFlow > 0 ? (income / totalFlow) * 100 : 0;
  const expensePercent = totalFlow > 0 ? (expense / totalFlow) * 100 : 0;

  // Tính tỷ lệ tiết kiệm
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  const isDeficit = expense > income;

  return (
    <main className="w-full bg-background p-4 md:p-6 md:px-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
      <header className="flex items-center justify-between mb-2">
        <div className="flex flex-col items-start gap-1 group cursor-default">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-xs text-white px-1 tracking-tight">04</span>
              <span className="h-3 w-[1px] bg-white/20" />
              <span className="text-xs text-white/70 px-1 tracking-tight">2026</span>
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

      {/* Metrics Row (3 Cards trên cùng) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SpotlightCard 
          color="rgba(59,130,246,0.15)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-blue-500/10 bg-[#0a0a0a]/60 shadow-xl"
        >
          {/* Sparkline chìm cho Tiền mặt */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.05] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-blue-400">
              <path d="M0,15 C10,14 20,16 35,12 C50,8 65,15 80,10 C90,7 95,8 100,6 L100,20 L0,20 Z" fill="currentColor" />
            </svg>
          </div>

          <div className="p-6 flex flex-col gap-4 relative z-10">
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
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Tiền mặt</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Income Card */}
        <SpotlightCard
          color="rgba(16,185,129,0.15)"
          className="rounded-3xl border border-emerald-500/10 bg-[#0a0a0a]/60 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Sparkline chìm (Sóng xanh lên) */}
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
            <div className="absolute top-1.5 right-1.5 z-30">
              <TransactionModal currentUser={currentUser} defaultType="INCOME">
                <MagneticButton>
                  <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm border border-emerald-500/20">
                    <Plus className="h-6 w-6" />
                  </button>
                </MagneticButton>
              </TransactionModal>
            </div>
            <div className="flex items-center justify-between mt-4 relative z-20 px-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5 shadow-sm">Thu nhập</span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
                Mục tiêu: {GOALS[currentUser.id as keyof typeof GOALS].income / 1000000} triệu
              </span>
            </div>
          </div>
          
          {/* Savings Goal Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 overflow-hidden rounded-b-3xl">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((income / (GOALS[currentUser.id as keyof typeof GOALS].income)) * 100, 100)}%` }}
              className="h-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            />
          </div>
        </SpotlightCard>

        {/* Expense Card */}
        <SpotlightCard
          color="rgba(249,115,22,0.15)"
          className="rounded-3xl border border-orange-500/10 bg-[#0a0a0a]/60 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Sparkline chìm (Sóng cam xuống) */}
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
            <div className="absolute top-1.5 right-1.5 z-30">
              <TransactionModal currentUser={currentUser} defaultType="EXPENSE">
                <MagneticButton>
                  <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-sm border border-orange-500/20">
                    <Plus className="h-6 w-6" />
                  </button>
                </MagneticButton>
              </TransactionModal>
            </div>
            <div className="flex items-center justify-between mt-4 relative z-20 px-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5 shadow-sm">Chi tiêu</span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">
                Ngân sách: {GOALS[currentUser.id as keyof typeof GOALS].expense / 1000000} triệu
              </span>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 overflow-hidden rounded-b-3xl">
            {(() => {
              const spent = expense;
              const limit = GOALS[currentUser.id as keyof typeof GOALS].expense;
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

      {/* Comparison Bars (Thu nhập vs Chi tiêu) */}
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
        {/* Savings Rate Badge */}
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
              <span className="text-xs font-bold text-emerald-400">{formatMoney(income)}</span>
            </div>
            <div className="h-2 w-full bg-emerald-500/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ 
                   width: `${incomePercent}%`,
                 }}
                 transition={{ 
                   width: { duration: 1, delay: 0.5 },
                 }}
                 className="h-full origin-bottom bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
               />
            </div>
          </div>

          {/* Expense Bar */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-3 px-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">Chi tiêu</span>
              <span className={cn("text-xs font-bold", isDeficit ? "text-orange-500" : "text-orange-400")}>
                {formatMoney(expense)}
              </span>
            </div>
            <div className="h-2 w-full bg-orange-500/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ 
                   width: `${expensePercent}%`,
                 }}
                 transition={{ 
                   width: { duration: 1, delay: 0.7 },
                 }}
                 className="h-full origin-bottom bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
               />
            </div>
          </div>
        </div>
      </motion.div>


      {/* Monthly Trend Chart (Mid) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl border border-white/5 bg-card/80 p-6 md:p-8 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary opacity-80" />
            <h3 className="text-sm font-bold tracking-wide uppercase opacity-90">Xu hướng dòng tiền</h3>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
             Tháng này
          </div>
        </div>
        
        {/* Recharts Area Chart */}
        <div className="h-[220px] w-full mt-2">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                Đang vẽ biểu đồ...
            </div>
          ) : (
            <div className="h-[200px] mt-4 ml-[-20px]">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData.length > 0 ? trendData : MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                      minTickGap={30}
                    />
                    <YAxis 
                      hide
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1c1c1c', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ padding: '0px' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(val: any) => val !== undefined ? [formatMoney(Number(val)), ""] : ["0", ""]}
                      cursor={{ stroke: 'white', strokeWidth: 1, strokeOpacity: 0.1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                      animationDuration={1500}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorExpense)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
        
        {/* Net Cash Flow summary */}
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
            <div>
               <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Dòng tiền thuần</p>
               <p className={cn("text-xl md:text-2xl font-bold tracking-tight", (data?.cashFlow ?? 0) >= 0 ? "text-emerald-400" : "text-orange-400")}>
                  {loading ? "---" : ((data?.cashFlow ?? 0) > 0 ? "+" : "") + formatMoney(data?.cashFlow ?? 0)}
               </p>
            </div>
            <div className="flex gap-4">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground uppercase">Thu</span>
                  <span className="text-xs font-bold text-emerald-500">{incomePercent.toFixed(0)}%</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground uppercase">Chi</span>
                  <span className="text-xs font-bold text-orange-500">{expensePercent.toFixed(0)}%</span>
               </div>
            </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4 px-2">
           <div className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5 opacity-70" />
              <h3 className="text-sm md:text-base font-bold tracking-wide">Giao dịch gần đây</h3>
           </div>
           <button className="text-xs text-primary hover:underline font-medium transition-all">Xem tất cả</button>
        </div>

        <div className="rounded-3xl border border-white/5 bg-card/50 overflow-hidden backdrop-blur-md">
          {loading ? (
             <div className="p-8 text-center text-sm text-muted-foreground opacity-50 animate-pulse">Đang tải dữ liệu...</div>
          ) : recentTrx.length === 0 ? (
             <div className="p-8 text-center text-sm text-muted-foreground">Chưa có giao dịch nào trong tháng này.</div>
          ) : (
             <div className="divide-y divide-white/5">
                {recentTrx.map((trx, idx) => {
                  const isIncome = trx.type === 'INCOME';
                  return (
                    <div key={trx.id || idx} className="flex items-center justify-between p-4 px-5 md:px-6 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-accent flex items-center justify-center text-lg md:text-xl shadow-inner group-hover:scale-105 transition-transform">
                          {trx.categories?.icon || (isIncome ? "💰" : "🛒")}
                        </div>
                        <div className="flex flex-col">
                           <span className="font-semibold text-sm md:text-base">{trx.categories?.name || "Khác"}</span>
                           <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{trx.note || "Không có ghi chú"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={cn("font-bold text-sm md:text-base", isIncome ? "text-emerald-400" : "")}>
                           {isIncome ? "+" : "-"}{formatMoney(trx.amount)}
                         </span>
                         <span className="text-[10px] text-muted-foreground mt-1 opacity-70 uppercase tracking-wider">
                           {new Date(trx.created_at || trx.date).toLocaleDateString('vi-VN')}
                         </span>
                      </div>
                    </div>
                  )
                })}
             </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Đang tải Dashboard...</div>}>
      <Dashboard />
    </Suspense>
  );
}
