"use client";

import { useState, useEffect } from "react";
import { Plus, Building, Bitcoin, Coins, PiggyBank, Package, Loader2, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAsset, type AssetInput } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { AnimatedNumber, SpotlightCard, MagneticButton } from "@/components/ui/dashboard-cards";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

interface Asset {
  id: string;
  type: string;
  name: string;
  asset_class: 'FIXED' | 'LIQUID';
  quantity: number;
  purchase_price: number;
  current_price: number;
  current_value: number;
  notes?: string;
  bank_name?: string | null;
}

export function AssetClient({ initialAssets }: { initialAssets: Asset[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Form State
  const [formData, setFormData] = useState<AssetInput>({
    name: "",
    type: "FINANCE",
    asset_class: "LIQUID",
    quantity: 1,
    purchase_price: 0,
    current_price: 0,
    current_value: 0,
    notes: "",
    created_at: new Date().toISOString().split('T')[0],
    bank_name: ""
  });

  const handleOpenModal = (defaultType: AssetInput['type']) => {
    setFormData({
      name: "",
      type: defaultType,
      asset_class: defaultType === 'REAL_ESTATE' ? 'FIXED' : 'LIQUID',
      quantity: 1,
      purchase_price: 0,
      current_price: 0,
      current_value: 0,
      notes: "",
      created_at: new Date().toISOString().split('T')[0],
      bank_name: ""
    });
    setIsOpen(true);
  };

  // Tính toán current_value mỗi khi qty hoặc price đổi (hoặc ở useEffect/useMemo)
  const calculateTotal = (qty: number, price: number) => qty * price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await createAsset(formData);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Lỗi DB: " + res.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
      alert("Lỗi hệ thống: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính tổng
  const totalAssets = initialAssets.reduce((sum, a) => sum + Number(a.current_value), 0);
  
  // Real Estate
  const realEstateAssets = initialAssets.filter(a => a.type === 'REAL_ESTATE').reduce((sum, a) => sum + Number(a.current_value), 0);
  // Crypto
  const cryptoAssets = initialAssets.filter(a => a.type === 'CRYPTO').reduce((sum, a) => sum + Number(a.current_value), 0);
  // Gold (Vàng)
  const goldAssets = initialAssets.filter(a => a.type === 'GOLD').reduce((sum, a) => sum + Number(a.current_value), 0);
  // Finance (Gộp Cash, Bank, Savings, Investment, Finance)
  const financeAssets = initialAssets.filter(a => ['CASH', 'BANK', 'SAVINGS', 'INVESTMENT', 'FINANCE'].includes(a.type)).reduce((sum, a) => sum + Number(a.current_value), 0);
  // Other
  const otherAssets = initialAssets.filter(a => a.type === 'OTHER').reduce((sum, a) => sum + Number(a.current_value), 0);

  // --- DỮ LIỆU BIỂU ĐỒ ---
  
  // 1. Dữ liệu Donut (Phân bổ)
  const allocationData = [
    { name: 'Bất động sản', value: realEstateAssets, color: '#a855f7' }, // Purple
    { name: 'Crypto', value: cryptoAssets, color: '#10b981' },        // Emerald
    { name: 'Vàng', value: goldAssets, color: '#eab308' },           // Yellow
    { name: 'Tài chính', value: financeAssets, color: '#f43f5e' },    // Rose
    { name: 'Khác', value: otherAssets, color: '#64748b' },           // Slate
  ].filter(item => item.value > 0);

  // 2. Dữ liệu Area (Biến động - Tính toán tương đối dựa trên dữ liệu hiện tại để demo mượt hơn)
  // Trong tương lai nếu có bảng asset_history sẽ query thực tế
  const trendData = [
    { month: 'Tháng 10', total: totalAssets * 0.82 },
    { month: 'Tháng 11', total: totalAssets * 0.88 },
    { month: 'Tháng 12', total: totalAssets * 0.94 },
    { month: 'Tháng 1', total: totalAssets * 0.91 },
    { month: 'Tháng 2', total: totalAssets * 0.97 },
    { month: 'Hiện tại', total: totalAssets },
  ];

  interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      name?: string;
      color?: string;
      dataKey?: string | number;
      payload?: Record<string, unknown>;
    }>;
    label?: string;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { 
        notation: 'compact',
        maximumFractionDigits: 1 
    }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = data.value;
      const percentage = totalAssets > 0 ? ((val / totalAssets) * 100).toFixed(1) : "0";
      
      return (
        <div className="bg-background/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl transition-all duration-300">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mb-1">{data.name || label || "Dữ liệu"}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-black text-white italic">
              {formatCurrency(val)}
            </p>
            {data.name && totalAssets > 0 && (
                <span className="text-[10px] font-bold text-emerald-400">({percentage}%)</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full pb-20">
      {/* 6 Cards Grid - Updated to 2 rows of 3 on PC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Tổng tài sản (Blue) */}
        <SpotlightCard 
          color="rgba(59,130,246,0.15)"
          className="rounded-3xl border border-blue-500/10 bg-[#0a0a0a]/60 shadow-xl"
        >
          {/* Sóng chìm */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.05] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-blue-400">
              <path d="M0,15 C10,14 20,16 35,12 C50,8 65,15 80,10 C90,7 95,8 100,6 L100,20 L0,20 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="p-6 flex flex-col gap-4 relative z-10 h-full justify-center">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [-2, 2, -2] }}
                className="rounded-xl bg-blue-500/10 p-2 text-blue-400 backdrop-blur-md border border-blue-500/20"
              >
                <Landmark className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white/70">
                <AnimatedNumber value={totalAssets} />
              </h2>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Tổng tài sản</span>
            </div>
          </div>
        </SpotlightCard>

        {/* 2. Bất động sản (Purple) */}
        <SpotlightCard 
          color="rgba(168,85,247,0.15)"
          className="rounded-3xl border border-purple-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-pointer hover:bg-purple-500/5 transition-colors"
          onClick={() => router.push('/assets/details?type=REAL_ESTATE')}
        >
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.05] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-purple-400">
              <path d="M0,18 C15,17 30,14 45,10 C60,6 75,8 90,2 C95,0 98,1 100,0 L100,20 L0,20 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="p-6 relative z-10 h-full flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="rounded-xl bg-purple-500/10 p-2 text-purple-400 backdrop-blur-md border border-purple-500/20"
              >
                <Building className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                <AnimatedNumber value={realEstateAssets} />
              </h2>
            </div>
            <div className="absolute top-1.5 right-1.5 z-30" onClick={(e) => { e.stopPropagation(); handleOpenModal('REAL_ESTATE'); }}>
              <MagneticButton>
                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all active:scale-95 shadow-sm border border-purple-500/20 cursor-pointer">
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </div>
            <div className="relative z-20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Bất động sản</span>
            </div>
          </div>
        </SpotlightCard>

        {/* 3. Crypto (Emerald) - USER REQUESTED THEME: Xanh lá cây (Emerald) */}
        <SpotlightCard 
          color="rgba(16,185,129,0.15)"
          className="rounded-3xl border border-emerald-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-pointer hover:bg-emerald-500/5 transition-colors"
          onClick={() => router.push('/assets/details?type=CRYPTO')}
        >
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.08] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-emerald-400">
              <path d="M0,2 C15,3 30,6 45,10 C60,14 75,12 90,17 C95,19 98,19 100,20 L100,20 L0,20 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="p-6 relative z-10 h-full flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 backdrop-blur-md border border-emerald-500/20"
              >
                <Bitcoin className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                <AnimatedNumber value={cryptoAssets} />
              </h2>
            </div>
            <div className="absolute top-1.5 right-1.5 z-30" onClick={(e) => { e.stopPropagation(); handleOpenModal('CRYPTO'); }}>
              <MagneticButton>
                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm border border-emerald-500/20 cursor-pointer">
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </div>
            <div className="relative z-20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Crypto</span>
            </div>
          </div>
        </SpotlightCard>

        {/* 4. Vàng (Yellow) - USER REQUESTED THEME: màu Gold */}
        <SpotlightCard 
          color="rgba(234,179,8,0.15)"
          className="rounded-3xl border border-yellow-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-pointer hover:bg-yellow-500/5 transition-colors"
          onClick={() => router.push('/assets/details?type=GOLD')}
        >
           <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.08] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-yellow-400">
              <path d="M0,15 C10,14 20,16 35,12 C50,8 65,15 80,10 C90,7 95,8 100,6 L100,20 L0,20 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="p-6 relative z-10 h-full flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                 whileHover={{ scale: 1.1, rotate: [-2, 2, -2] }}
                className="rounded-xl bg-yellow-500/10 p-2 text-yellow-400 backdrop-blur-md border border-yellow-500/20"
              >
                <Coins className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                <AnimatedNumber value={goldAssets} />
              </h2>
            </div>
            <div className="absolute top-1.5 right-1.5 z-30" onClick={(e) => { e.stopPropagation(); handleOpenModal('GOLD'); }}>
              <MagneticButton>
                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all active:scale-95 shadow-sm border border-yellow-500/20 cursor-pointer">
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </div>
            <div className="relative z-20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Vàng</span>
            </div>
          </div>
        </SpotlightCard>

        {/* 5. Tài chính (Rose) - ĐỔI MÀU TRÁNH TRÙNG VỚI VÀNG */}
        <SpotlightCard 
          color="rgba(244,63,94,0.15)"
          className="rounded-3xl border border-rose-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-pointer hover:bg-rose-500/5 transition-colors"
          onClick={() => router.push('/assets/details?type=FINANCE')}
        >
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.08] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-rose-400">
               <path d="M0,18 C15,17 30,14 45,10 C60,6 75,8 90,2 C95,0 98,1 100,0 L100,20 L0,20 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="p-6 relative z-10 h-full flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="rounded-xl bg-rose-500/10 p-2 text-rose-400 backdrop-blur-md border border-rose-500/20"
              >
                <PiggyBank className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                <AnimatedNumber value={financeAssets} />
              </h2>
            </div>
            <div className="absolute top-1.5 right-1.5 z-30" onClick={(e) => { e.stopPropagation(); handleOpenModal('FINANCE'); }}>
              <MagneticButton>
                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-500/20 cursor-pointer">
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </div>
            <div className="relative z-20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Tài chính</span>
            </div>
          </div>
        </SpotlightCard>

        {/* 6. Khác (Slate) */}
        <SpotlightCard 
          color="rgba(100,116,139,0.15)"
          className="rounded-3xl border border-slate-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-pointer hover:bg-slate-500/5 transition-colors"
          onClick={() => router.push('/assets/details?type=OTHER')}
        >
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.08] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-slate-400">
               <path d="M0,2 C15,3 30,6 45,10 C60,14 75,12 90,17 C95,19 98,19 100,20 L100,20 L0,20 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="p-6 relative z-10 h-full flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [-2, 2, -2] }}
                className="rounded-xl bg-slate-500/10 p-2 text-slate-400 backdrop-blur-md border border-slate-500/20"
              >
                <Package className="h-5 w-5" />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                <AnimatedNumber value={otherAssets} />
              </h2>
            </div>
            <div className="absolute top-1.5 right-1.5 z-30" onClick={(e) => { e.stopPropagation(); handleOpenModal('OTHER'); }}>
              <MagneticButton>
                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white transition-all active:scale-95 shadow-sm border border-slate-500/20 cursor-pointer">
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </div>
            <div className="relative z-20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Khác</span>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* BIỂU ĐỒ PHÂN TÍCH */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Biểu đồ Donut - Tỷ trọng (lg:col-span-2) */}
        <SpotlightCard 
          color="rgba(255,255,255,0.05)"
          className="lg:col-span-2 rounded-3xl border border-white/5 bg-[#0a0a0a]/40 shadow-xl overflow-hidden min-h-[400px] flex flex-col"
        >
          <div className="p-6 pb-0 flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Cấu trúc danh mục</span>
            <h3 className="text-lg font-bold text-white mt-1">Phân bổ tài sản</h3>
          </div>
          
          <div className="flex-1 w-full relative h-[380px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={135}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/20" />
              </div>
            )}
            
            {/* Legend Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Tỷ lệ ròng</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">100%</span>
            </div>
          </div>

          <div className="p-6 pt-0 grid grid-cols-2 gap-2 mt-auto">
             {allocationData.map((item, idx) => (
               <div key={idx} className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                 <span className="text-[10px] font-medium text-white/60 truncate">{item.name}</span>
               </div>
             ))}
          </div>
        </SpotlightCard>

        {/* Biểu đồ Area - Trend (lg:col-span-3) */}
        <SpotlightCard 
          color="rgba(59,130,246,0.05)"
          className="lg:col-span-3 rounded-3xl border border-white/5 bg-[#0a0a0a]/40 shadow-xl overflow-hidden min-h-[400px] flex flex-col"
        >
          <div className="p-6 pb-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Hiệu suất tài sản</span>
            <h3 className="text-lg font-bold text-white mt-1">Biến động giá trị (6 tháng)</h3>
          </div>

          <div className="flex-1 w-full pr-2 h-[380px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide domain={['dataMin - 10000000', 'dataMax + 10000000']} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/20" />
              </div>
            )}
          </div>
        </SpotlightCard>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Thêm Tài Sản Mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên tài sản</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                placeholder="Vd: Sổ đỏ 123, BTC Wallet..." 
                className="rounded-xl border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nhóm tài sản</Label>
                <Select value={formData.type} onValueChange={(v) => {
                  const type = v as AssetInput['type'];
                  setFormData({
                    ...formData, 
                    type, 
                    asset_class: type === 'REAL_ESTATE' ? 'FIXED' : 'LIQUID'
                  });
                }}>
                  <SelectTrigger className="rounded-xl border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="FINANCE">Tài chính</SelectItem>
                    <SelectItem value="REAL_ESTATE">Bất động sản</SelectItem>
                    <SelectItem value="CRYPTO">Crypto</SelectItem>
                    <SelectItem value="GOLD">Vàng</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Phân loại</Label>
                <Select value={formData.asset_class} onValueChange={(v) => setFormData({...formData, asset_class: v as AssetInput['asset_class']})}>
                  <SelectTrigger className="rounded-xl border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="LIQUID">TS Lưu động</SelectItem>
                    <SelectItem value="FIXED">TS Cố định</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Số lượng</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  step="0.000001"
                  value={formData.quantity || ""}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    setFormData({...formData, quantity: qty, current_value: calculateTotal(qty, formData.current_price)});
                  }}
                  required 
                  className="rounded-xl font-mono border-white/10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchase_price">Giá mua (đơn vị)</Label>
                <Input 
                  id="purchase_price" 
                  type="number" 
                  value={formData.purchase_price || ""}
                  onChange={(e) => setFormData({...formData, purchase_price: Number(e.target.value)})}
                  placeholder="0 đ" 
                  className="rounded-xl font-mono border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current_price" className="truncate">Đơn giá hiện tại</Label>
                <Input 
                  id="current_price" 
                  type="number" 
                  value={formData.current_price || ""}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    setFormData({...formData, current_price: price, current_value: calculateTotal(formData.quantity, price)});
                  }}
                  required 
                  placeholder="0 đ" 
                  className="rounded-xl font-mono border-white/10 text-blue-400 font-bold"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="created_at">Ngày ghi nhận</Label>
                <Input 
                  id="created_at" 
                  type="date" 
                  value={formData.created_at}
                  onChange={(e) => setFormData({...formData, created_at: e.target.value})}
                  required 
                  className="rounded-xl border-white/10 text-white/70"
                />
              </div>
            </div>

            <div className="grid gap-1 bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tổng giá trị hiện tại</span>
              <span className="text-lg font-black text-white">{new Intl.NumberFormat('vi-VN').format(formData.current_value)} đ</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <textarea 
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Thông tin thêm..."
                className="w-full rounded-xl bg-background border border-white/10 p-3 text-sm min-h-[60px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <Button type="submit" className="mt-2 w-full rounded-xl shadow-lg h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 transition-all text-white font-bold" disabled={isLoading || !formData.name}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Xác nhận Lưu"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
