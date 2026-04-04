"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { cn, formatCurrency } from "@/lib/utils";

interface MonthlyTrendChartProps {
  trendData: Array<{ date: string; income: number; expense: number }>;
  loading: boolean;
  isMounted: boolean;
  cashFlow: number;
  incomePercent: number;
  expensePercent: number;
}

export function MonthlyTrendChart({ 
  trendData, 
  loading, 
  isMounted, 
  cashFlow, 
  incomePercent, 
  expensePercent 
}: MonthlyTrendChartProps) {
  return (
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
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <YAxis hide />
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
                    formatter={(val: any) => val !== undefined ? [formatCurrency(Number(val)), ""] : ["0", ""]}
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
             <p className={cn("text-xl md:text-2xl font-bold tracking-tight", cashFlow >= 0 ? "text-emerald-400" : "text-orange-400")}>
                {loading ? "---" : (cashFlow > 0 ? "+" : "") + formatCurrency(cashFlow)}
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
  );
}
