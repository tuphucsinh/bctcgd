"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, PieChart as PieChartIcon, Activity } from "lucide-react";

interface ReportsClientProps {
  summary: {
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
    assetDistribution: { name: string; value: number }[];
  } | null;
  monthlyCashflow: {
    month: string;
    income: number;
    expense: number;
    rawDate: string;
  }[];
  expensesByCategory: {
    name: string;
    value: number;
    count: number;
  }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
const EXPENSE_COLORS = ['#f43f5e', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#6366f1', '#d946ef'];

export function ReportsClient({ summary, monthlyCashflow, expensesByCategory }: ReportsClientProps) {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-white/50">
        Không có dữ liệu
      </div>
    );
  }

  // Calculate net cashflow for line chart overlay or separate metric
  const cashflowData = monthlyCashflow.map(item => ({
    ...item,
    net: item.income - item.expense
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f11] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-xl">
          <p className="text-white/80 text-xs font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white/60">{entry.name}:</span>
              <span className="text-white font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f11] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
            <span className="text-white/80 font-medium">{payload[0].name}</span>
          </div>
          <div className="text-white font-bold ml-4">
            {formatCurrency(payload[0].value)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Báo cáo & Phân tích</h1>
        <p className="text-sm text-white/50">Cái nhìn tổng quan về tình hình tài chính của bạn</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Tài sản ròng</h3>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(summary.netWorth)}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Tổng tài sản</h3>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(summary.totalAssets)}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingDown className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Tổng nợ</h3>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(summary.totalDebts)}</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Monthly Cashflow Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Dòng tiền hàng tháng (6 tháng)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff50', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff50', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', opacity: 0.8 }} />
                <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Chi tiêu" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expenses by Category */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col"
        >
          <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-rose-500" />
            Cơ cấu Chi tiêu (Tháng này)
          </h3>
          {expensesByCategory.length > 0 ? (
            <div className="h-[250px] w-full relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Overlay center total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-white/50">Tổng chi</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(expensesByCategory.reduce((sum, item) => sum + item.value, 0))}
                </span>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-white/30 text-sm">Chưa có dữ liệu chi tiêu</div>
          )}
          {/* Custom Legend for Pie */}
          <div className="mt-4 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {expensesByCategory.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }} />
                <span className="text-white/70 truncate flex-1">{item.name}</span>
                <span className="text-white/40">{Math.round((item.value / expensesByCategory.reduce((s, i) => s + i.value, 0)) * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Asset Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col"
        >
          <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-blue-500" />
            Phân bổ Tài sản
          </h3>
          {summary.assetDistribution.length > 0 ? (
            <div className="h-[250px] w-full relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.assetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {summary.assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Overlay center total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-white/50">Tổng TS</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(summary.totalAssets)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30 text-sm">Chưa có dữ liệu tài sản</div>
          )}
          {/* Custom Legend for Pie */}
          <div className="mt-4 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {summary.assetDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-white/70 truncate flex-1">{item.name}</span>
                <span className="text-white/40">{Math.round((item.value / summary.totalAssets) * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
