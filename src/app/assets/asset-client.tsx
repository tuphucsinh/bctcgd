"use client";

import { useState } from "react";
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

interface Asset {
  id: string;
  type: string;
  owner: string;
  name: string;
  bank_name?: string | null;
  current_value: number | string;
}

export function AssetClient({ initialAssets }: { initialAssets: Asset[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<AssetInput>({
    name: "",
    type: "CASH",
    current_value: 0,
    owner: "JOINT",
    bank_name: ""
  });

  const handleOpenModal = (defaultType: AssetInput['type']) => {
    setFormData({
      name: "",
      type: defaultType,
      current_value: 0,
      owner: "JOINT",
      bank_name: ""
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await createAsset(formData);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
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

  return (
    <div className="w-full pb-20">
      {/* 6 Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          className="rounded-3xl border border-purple-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-default"
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
            <div className="absolute top-1.5 right-1.5 z-30 flex items-start" onClick={(e) => { e.stopPropagation(); handleOpenModal('REAL_ESTATE'); }}>
              <MagneticButton>
                <button className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all active:scale-95 shadow-sm border border-purple-500/20 cursor-pointer">
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
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
          className="rounded-3xl border border-emerald-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-default"
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
            <div className="absolute top-1.5 right-1.5 z-30 flex items-start" onClick={(e) => { e.stopPropagation(); handleOpenModal('CRYPTO'); }}>
              <MagneticButton>
                <button className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm border border-emerald-500/20 cursor-pointer">
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
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
          className="rounded-3xl border border-yellow-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-default"
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
            <div className="absolute top-1.5 right-1.5 z-30 flex items-start" onClick={(e) => { e.stopPropagation(); handleOpenModal('GOLD'); }}>
              <MagneticButton>
                <button className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all active:scale-95 shadow-sm border border-yellow-500/20 cursor-pointer">
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
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
          className="rounded-3xl border border-rose-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-default"
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
            <div className="absolute top-1.5 right-1.5 z-30 flex items-start" onClick={(e) => { e.stopPropagation(); handleOpenModal('FINANCE'); }}>
              <MagneticButton>
                <button className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-500/20 cursor-pointer">
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
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
          className="rounded-3xl border border-slate-500/10 bg-[#0a0a0a]/60 shadow-xl cursor-default"
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
            <div className="absolute top-1.5 right-1.5 z-30 flex items-start" onClick={(e) => { e.stopPropagation(); handleOpenModal('OTHER'); }}>
              <MagneticButton>
                <button className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white transition-all active:scale-95 shadow-sm border border-slate-500/20 cursor-pointer">
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </MagneticButton>
            </div>
            <div className="relative z-20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-full inline-block border border-white/5">Khác</span>
            </div>
          </div>
        </SpotlightCard>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>Thêm Tài Khoản Mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên tài khoản</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                placeholder="Nhập tên tài khoản..." 
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Loại tài khoản</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as AssetInput['type']})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                    <SelectItem value="BANK">Thẻ ngân hàng</SelectItem>
                    <SelectItem value="SAVINGS">Sổ tiết kiệm</SelectItem>
                    <SelectItem value="INVESTMENT">Đầu tư</SelectItem>
                    <SelectItem value="FINANCE">Tài chính chung</SelectItem>
                    <SelectItem value="REAL_ESTATE">Bất động sản</SelectItem>
                    <SelectItem value="CRYPTO">Crypto</SelectItem>
                    <SelectItem value="GOLD">Vàng</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Thuộc về</Label>
                <Select value={formData.owner} onValueChange={(v) => setFormData({...formData, owner: v as AssetInput['owner']})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="JOINT">Cả Hai</SelectItem>
                    <SelectItem value="HIEU">Hiếu</SelectItem>
                    <SelectItem value="LY">Ly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current_value">Số dư ban đầu</Label>
              <Input 
                id="current_value" 
                type="number" 
                value={formData.current_value || ""}
                onChange={(e) => setFormData({...formData, current_value: Number(e.target.value)})}
                required 
                placeholder="0 đ" 
                className="rounded-xl font-mono"
              />
            </div>
            <Button type="submit" className="mt-2 w-full rounded-xl shadow-md h-12" disabled={isLoading || !formData.name}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Xác nhận Thêm"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
