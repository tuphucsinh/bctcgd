"use client";

import { useState, useEffect } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDebt, type DebtInput } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { AnimatedNumber, SpotlightCard, MagneticButton } from "@/components/ui/dashboard-cards";

interface Debt {
  id: string;
  name: string;
  debt_type: 'BORROW' | 'LEND';
  debtor_creditor: string;
  amount: number;
  remaining_amount: number;
  owner: 'HIEU' | 'LY';
  status: string;
}

export function DebtClient({ initialDebts }: { initialDebts: Debt[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState<'hieu' | 'ly' | 'all'>('all');

  useEffect(() => {
    // Component mounted
  }, []);

  const [formData, setFormData] = useState<DebtInput>({
    name: "",
    debtor_creditor: "",
    type: "PAYABLE",
    original_principal: 0,
    remaining_principal: 0,
    start_date: new Date().toISOString().split('T')[0],
    owner: "HIEU"
  });

  const filteredDebts = initialDebts.filter(d => {
    if (activeUserId === 'all') return true; // Hiển thị tất cả (HIEU, LY)
    return d.owner.toLowerCase() === activeUserId;
  });

  const payables = filteredDebts.filter(d => d.debt_type === 'BORROW');
  const receivables = filteredDebts.filter(d => d.debt_type === 'LEND');

  const totalPayable = payables.reduce((sum, d) => sum + Number(d.remaining_amount), 0);
  const totalReceivable = receivables.reduce((sum, d) => sum + Number(d.remaining_amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await createDebt({
        ...formData,
        remaining_principal: formData.original_principal
      });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi thêm khoản nợ");
    } finally {
      setIsLoading(false);
    }
  };

  const UserSwitcher = () => (
    <div className="flex p-0.5 rounded-full bg-white/[0.03] border border-white/[0.05] shadow-2xl">
      {(['hieu', 'ly', 'all'] as const).map((id) => (
        <button
          key={id}
          onClick={() => setActiveUserId(id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all",
            activeUserId === id
              ? "bg-white/5 text-white ring-1 ring-white/10 shadow-lg"
              : "text-white/20 hover:text-white/40"
          )}
        >
          <div className={cn(
            "w-1 h-1 rounded-full",
            id === 'hieu' ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" :
            id === 'ly' ? "bg-pink-500 shadow-[0_0_8px_#ec4899]" :
            "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
            activeUserId !== id && "opacity-20 shadow-none"
          )} />
          {id === 'all' ? 'Gia đình' : id.charAt(0).toUpperCase() + id.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full pb-20 px-4 md:px-0">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
            Quản lý <span className="text-orange-500">Công Nợ</span>
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-2 opacity-50">
            Hệ thống theo dõi vay & cho vay gia đình
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <UserSwitcher />
          <MagneticButton>
            <button 
              onClick={() => setIsOpen(true)}
              className="h-12 px-6 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5 stroke-[3]" />
              Thêm giao dịch
            </button>
          </MagneticButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <SpotlightCard 
          color="rgba(249,115,22,0.15)"
          className="rounded-3xl border border-orange-500/10 bg-[#0a0a0a]/60 shadow-xl overflow-hidden"
          onClick={() => router.push('/debts/details?type=PAYABLE')}
        >
          <div className="p-8 relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/10 p-2 text-orange-400 backdrop-blur-md border border-orange-500/20">
                <ArrowDownRight className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white italic">
                <AnimatedNumber value={totalPayable} />
              </h2>
            </div>
            <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-[0.2em] bg-orange-500/5 px-3 py-1 rounded-full border border-orange-500/10 w-fit">
              Tổng nợ phải trả
            </span>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          color="rgba(16,185,129,0.15)"
          className="rounded-3xl border border-emerald-500/10 bg-[#0a0a0a]/60 shadow-xl overflow-hidden"
          onClick={() => router.push('/debts/details?type=RECEIVABLE')}
        >
          <div className="p-8 relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 backdrop-blur-md border border-emerald-500/20">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white italic">
                <AnimatedNumber value={totalReceivable} />
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 w-fit">
              Tổng tiền cho vay
            </span>
          </div>
        </SpotlightCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDebts.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30 italic">
            <p className="text-sm font-medium tracking-widest uppercase">Không có dữ liệu công nợ</p>
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const original = Number(debt.amount);
            const remaining = Number(debt.remaining_amount);
            const paid = original - remaining;
            const progress = (paid / original) * 100;
            const isPayable = debt.debt_type === 'BORROW';

            return (
              <SpotlightCard 
                key={debt.id} 
                color={isPayable ? "rgba(249,115,22,0.1)" : "rgba(16,185,129,0.1)"}
                className="group p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl border",
                      isPayable ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      {isPayable ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white leading-tight uppercase italic tracking-tighter">{debt.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 mt-1">
                        {isPayable ? "Chủ nợ:" : "Con nợ:"} {debt.debtor_creditor}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Số dư</span>
                    <span className={cn("font-black text-xl italic tracking-tighter", isPayable ? "text-orange-400" : "text-emerald-400")}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000 ease-out", isPayable ? "bg-orange-500" : "bg-emerald-500")}
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-bold opacity-40 uppercase tracking-tighter">
                    <span>Gốc: {formatCurrency(original)}</span>
                    <span>Đã {isPayable ? 'trả' : 'thu'}: {formatCurrency(paid)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t border-white/5">
                  <button className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 transition-all border border-white/5">
                    Chi tiết
                  </button>
                  <button className={cn(
                    "flex-1 h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-black/20",
                    isPayable ? "bg-orange-500/80 hover:bg-orange-500" : "bg-emerald-500/80 hover:bg-emerald-500"
                  )}>
                    {isPayable ? 'Trả nợ' : 'Nhận tiền'}
                  </button>
                </div>
              </SpotlightCard>
            );
          })
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border border-white/10 bg-background/95 backdrop-blur-3xl shadow-2xl overflow-hidden p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Giao dịch Công Nợ
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Loại</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as DebtInput['type']})}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12 text-xs font-bold uppercase tracking-wider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-[#111] border-white/10">
                    <SelectItem value="PAYABLE" className="text-xs font-bold uppercase tracking-wider text-orange-400">Mình đi vay</SelectItem>
                    <SelectItem value="RECEIVABLE" className="text-xs font-bold uppercase tracking-wider text-emerald-400">Cho vay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sở hữu</Label>
                <Select value={formData.owner} onValueChange={(v) => setFormData({...formData, owner: v as DebtInput['owner']})}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12 text-xs font-bold uppercase tracking-wider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-[#111] border-white/10">
                    <SelectItem value="HIEU" className="text-xs font-bold uppercase tracking-wider">Hiếu</SelectItem>
                    <SelectItem value="LY" className="text-xs font-bold uppercase tracking-wider">Ly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tiêu đề khoản nợ</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                placeholder="Vd: Vay mua xe, Cho Anh A mượn..." 
                className="rounded-xl border-white/10 bg-white/5 h-12 px-4 shadow-inner"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Đối tượng</Label>
              <Input 
                value={formData.debtor_creditor}
                onChange={(e) => setFormData({...formData, debtor_creditor: e.target.value})}
                required 
                placeholder={formData.type === 'PAYABLE' ? "Tên chủ nợ (Ngân hàng, bạn bè...)" : "Tên con nợ"}
                className="rounded-xl border-white/10 bg-white/5 h-12 px-4 shadow-inner"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tổng số tiền gốc</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={formData.original_principal || ""}
                  onChange={(e) => setFormData({...formData, original_principal: Number(e.target.value)})}
                  required 
                  placeholder="0" 
                  className={cn(
                    "rounded-xl border-white/10 bg-white/5 h-12 px-4 font-mono text-lg font-bold shadow-inner",
                    formData.type === 'PAYABLE' ? "text-orange-400" : "text-emerald-400"
                  )} 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">₫</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className={cn(
                "mt-2 w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95",
                formData.type === 'PAYABLE' ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-500 hover:bg-emerald-600"
              )} 
              disabled={isLoading || !formData.name}
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "XÁC NHẬN LƯU KHOẢN NỢ"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
