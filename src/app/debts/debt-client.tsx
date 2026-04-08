"use client";

import { useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDebt, recordDebtTransaction, updateDebt, deleteDebt, type DebtInput } from "@/lib/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatedNumber, SpotlightCard, MagneticButton } from "@/components/ui/dashboard-cards";
import { toast } from "sonner";

interface Debt {
  id: string;
  name: string;
  debt_type: 'BORROW' | 'LEND';
  initial_principal: number;
  remaining_principal: number;
  interest_rate?: number;
  monthly_payment_amount?: number;
  status?: string;
}

export function DebtClient({ initialDebts }: { initialDebts: Debt[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || "hieu";
  const filteredDebts = initialDebts;

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State cho Modal thao tác nợ (trả lãi/gốc)
  const [opModal, setOpModal] = useState<{
    isOpen: boolean;
    debtId: string;
    debtName: string;
    debtType?: 'BORROW' | 'LEND';
    isPrincipal: boolean;
    amount: string;
  }>({
    isOpen: false,
    debtId: "",
    debtName: "",
    debtType: 'BORROW',
    isPrincipal: true,
    amount: ""
  });

  const [formData, setFormData] = useState<DebtInput>({
    name: "",
    type: "PAYABLE",
    original_principal: 0,
    remaining_principal: 0,
    interest_rate: 0,
    monthly_payment_amount: 0,
    term: 'LONG_TERM'
  });

  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  const payables = filteredDebts.filter(d => d.debt_type === 'BORROW');
  const receivables = filteredDebts.filter(d => d.debt_type === 'LEND');

  const totalPayable = payables.reduce((sum, d) => sum + Number(d.remaining_principal), 0);
  const totalReceivable = receivables.reduce((sum, d) => sum + Number(d.remaining_principal), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = editingDebtId 
        ? await updateDebt(editingDebtId, formData)
        : await createDebt({
            ...formData,
            remaining_principal: formData.original_principal // Khi tạo mới, gốc còn lại = gốc ban đầu
          });

      if (result.success) {
        toast.success(editingDebtId ? "Đã cập nhật khoản nợ" : "Đã thêm khoản nợ mới");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingDebtId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa khoản nợ này?")) return;

    setIsLoading(true);
    try {
      const result = await deleteDebt(editingDebtId);
      if (result.success) {
        toast.success("Đã xóa khoản nợ");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Không thể xóa");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opModal.amount || isNaN(Number(opModal.amount.replace(/\./g, '')))) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      const numericAmount = Number(opModal.amount.replace(/\./g, ''));
      
      const result = await recordDebtTransaction({
        debtId: opModal.debtId,
        amount: numericAmount,
        isPrincipal: opModal.isPrincipal,
        userId: userId
      });

      if (result.success) {
        toast.success("Đã ghi nhận giao dịch thành công");
        setOpModal(prev => ({ ...prev, isOpen: false, amount: "" }));
        router.refresh();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  const openOpModal = (debt: Debt, isPrincipal: boolean) => {
    let amountVal = "";
    
    if (isPrincipal) {
      if (debt.monthly_payment_amount) {
        amountVal = debt.monthly_payment_amount.toString();
      }
    } else {
      // Tính lãi mặc định: gốc còn lại * (lãi suất năm / 100) / 12
      if (debt.interest_rate) {
        const monthlyInterest = Math.round((debt.remaining_principal * (debt.interest_rate / 100)) / 12);
        amountVal = monthlyInterest.toString();
      }
    }

    const formattedAmount = amountVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    setOpModal({
      isOpen: true,
      debtId: debt.id,
      debtName: debt.name,
      debtType: debt.debt_type, // Thêm để dùng cho tiêu đề
      isPrincipal: isPrincipal,
      amount: formattedAmount
    });
  };

  const openDebtModal = (e: React.MouseEvent, type: 'PAYABLE' | 'RECEIVABLE', debt?: Debt) => {
    e.stopPropagation();
    if (debt) {
      setEditingDebtId(debt.id);
      setFormData({
        name: debt.name,
        type: debt.debt_type === 'BORROW' ? 'PAYABLE' : 'RECEIVABLE',
        original_principal: debt.initial_principal,
        remaining_principal: debt.remaining_principal,
        interest_rate: debt.interest_rate || 0,
        monthly_payment_amount: debt.monthly_payment_amount || 0,
        term: 'LONG_TERM' // Map term correctly if needed
      });
    } else {
      setEditingDebtId(null);
      setFormData({
        name: "",
        type,
        original_principal: 0,
        remaining_principal: 0,
        interest_rate: 0,
        monthly_payment_amount: 0,
        term: 'LONG_TERM'
      });
    }
    setIsOpen(true);
  };

  return (
    <div className="w-full pb-20 px-4 md:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <SpotlightCard 
          color="rgba(249,115,22,0.15)"
          className="rounded-3xl border border-orange-500/10 bg-[#0a0a0a]/60 shadow-xl overflow-hidden relative"
        >
          <div className="p-6 pl-4 relative z-10 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3 relative z-20">
              <div className="rounded-xl bg-orange-500/10 p-2 text-orange-400 backdrop-blur-md border border-orange-500/20">
                <ArrowDownRight className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white italic">
                <AnimatedNumber value={totalPayable} />
              </h2>
            </div>
            <div 
              className="absolute top-1.5 right-1.5 z-30"
              onClick={(e) => openDebtModal(e, 'PAYABLE')}
            >
              <MagneticButton>
                <button 
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-sm border border-orange-500/20"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </div>
            <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-[0.2em] bg-orange-500/5 px-3 py-1 rounded-full border border-orange-500/10 w-fit">
              Tổng nợ phải trả
            </span>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          color="rgba(16,185,129,0.15)"
          className="rounded-3xl border border-emerald-500/10 bg-[#0a0a0a]/60 shadow-xl overflow-hidden relative"
        >
          <div className="p-6 pl-4 relative z-10 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3 relative z-20">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 backdrop-blur-md border border-emerald-500/20">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white italic">
                <AnimatedNumber value={totalReceivable} />
              </h2>
            </div>
            <div 
              className="absolute top-1.5 right-1.5 z-30"
              onClick={(e) => openDebtModal(e, 'RECEIVABLE')}
            >
              <MagneticButton>
                <button 
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm border border-emerald-500/20"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </MagneticButton>
            </div>
            <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 w-fit">
              Tổng tiền cho vay
            </span>
          </div>
        </SpotlightCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cột Nợ Phải Trả */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/40">Các khoản nợ</h3>
            <span className="text-[10px] font-bold text-white/20">{payables.length} khoản</span>
          </div>
          <div className="flex flex-col gap-3">
            {payables.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-white/5 p-8 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">Không có khoản nợ nào</span>
              </div>
            ) : (
              payables.map((debt) => (
                <div
                  key={debt.id}
                  onClick={(e) => openDebtModal(e, 'PAYABLE', debt)}
                  className="group cursor-pointer rounded-3xl border border-white/5 bg-zinc-950/50 pt-2.5 pb-3 px-4 transition-all hover:bg-white/5 flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Hàng 1: Tên và Số tiền */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-white tracking-tight mt-1">{debt.name}</span>
                      {Number(debt.interest_rate) > 0 && (
                        <span className="text-[9px] font-medium text-white/20 uppercase tracking-widest leading-none">
                          Lãi suất: {debt.interest_rate}%/năm
                        </span>
                      )}
                    </div>
                    <span className="text-base font-black text-white tracking-tighter italic">
                      {formatCurrency(debt.remaining_principal)}
                    </span>
                  </div>

                  {/* Hàng 2: Trả lãi/gốc */}
                  <div className="flex items-center justify-end gap-2 relative z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openOpModal(debt, false);
                      }}
                      className="h-8 px-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold text-orange-500 uppercase tracking-widest transition-all hover:bg-orange-500/20 active:scale-95"
                    >
                      Trả lãi
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openOpModal(debt, true);
                      }}
                      className="h-8 px-3 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
                    >
                      Trả nợ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột Cho Vay */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/40">Các khoản cho vay</h3>
            <span className="text-[10px] font-bold text-white/20">{receivables.length} khoản</span>
          </div>
          <div className="flex flex-col gap-3">
            {receivables.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-white/5 p-8 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">Không có khoản cho vay nào</span>
              </div>
            ) : (
              receivables.map((debt) => (
                <div
                  key={debt.id}
                  onClick={(e) => openDebtModal(e, 'RECEIVABLE', debt)}
                  className="group cursor-pointer rounded-3xl border border-white/5 bg-zinc-950/50 pt-2.5 pb-3 px-4 transition-all hover:bg-white/5 flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Hàng 1: Tên và Số tiền */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-white tracking-tight mt-1">{debt.name}</span>
                      {Number(debt.interest_rate) > 0 && (
                        <span className="text-[9px] font-medium text-white/20 uppercase tracking-widest leading-none">
                          Lãi suất: {debt.interest_rate}%/năm
                        </span>
                      )}
                    </div>
                    <span className="text-base font-black text-white tracking-tighter italic">
                      {formatCurrency(debt.remaining_principal)}
                    </span>
                  </div>

                  {/* Hàng 2: Nhận tiền */}
                  <div className="flex items-center justify-end relative z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openOpModal(debt, true);
                      }}
                      className="h-8 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500 uppercase tracking-widest transition-all hover:bg-emerald-500/20 active:scale-95"
                    >
                      Nhận tiền
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-white/5 p-8 rounded-[40px] shadow-2xl backdrop-blur-3xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              {editingDebtId ? 'Chi tiết khoản nợ' : 'Thêm giao dịch'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'PAYABLE' })}
                className={cn(
                  "h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  formData.type === 'PAYABLE'
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-white/40 hover:text-white/60"
                )}
              >
                Nợ (Payable)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'RECEIVABLE' })}
                className={cn(
                  "h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  formData.type === 'RECEIVABLE'
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-white/40 hover:text-white/60"
                )}
              >
                Cho vay (Receivable)
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Tên {formData.type === 'PAYABLE' ? 'khoản nợ' : 'khoản cho vay'}</Label>
              <Input
                id="name"
                placeholder={formData.type === 'PAYABLE' ? "VD: Vay mua nhà" : "VD: Cho Minh vay"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/5 h-12 px-5 rounded-2xl text-white placeholder:text-white/10 focus:ring-0 focus:border-white/20 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {editingDebtId ? (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 text-orange-400">Gốc hiện tại</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formData.remaining_principal ? new Intl.NumberFormat('vi-VN').format(formData.remaining_principal) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, remaining_principal: Number(rawValue) });
                      }}
                      className="bg-orange-500/5 border-orange-500/20 h-12 px-5 rounded-2xl text-white focus:ring-0 focus:border-orange-500/40"
                      placeholder="Số tiền còn nợ thực tế"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-500/20 uppercase italic font-bold">REMAINING</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Số tiền (VND)</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formData.original_principal ? new Intl.NumberFormat('vi-VN').format(formData.original_principal) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, original_principal: Number(rawValue) });
                      }}
                      className="bg-white/5 border-white/5 h-12 px-5 rounded-2xl text-white focus:ring-0 focus:border-white/20"
                      placeholder="2.000.000"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10 uppercase italic">VND</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Lãi suất (% / năm)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.interest_rate ?? 0}
                    onChange={(e) => setFormData({ ...formData, interest_rate: Number(e.target.value) || 0 })}
                    className="bg-white/5 border-white/5 h-12 px-5 rounded-2xl text-white focus:ring-0 focus:border-white/20"
                    placeholder="8.5"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10 uppercase italic">%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Gốc trả hằng tháng</Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={new Intl.NumberFormat('vi-VN').format(formData.monthly_payment_amount || 0)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, monthly_payment_amount: Number(rawValue) || 0 });
                    }}
                    className="bg-white/5 border-white/5 h-12 px-5 rounded-2xl text-white focus:ring-0 focus:border-white/20"
                    placeholder="10.000.000"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10 uppercase italic">VND/TH.</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="term" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Kỳ hạn</Label>
                <div className="relative">
                  <select
                    id="term"
                    value={formData.term || 'LONG_TERM'}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value as 'SHORT_TERM' | 'LONG_TERM'})}
                    className="w-full bg-white/5 border-white/5 h-12 px-5 rounded-2xl text-white appearance-none focus:ring-0 focus:border-white/20 transition-all font-bold"
                  >
                    <option value="LONG_TERM" className="bg-zinc-900 text-white font-medium">Dài hạn</option>
                    <option value="SHORT_TERM" className="bg-zinc-900 text-white font-medium">Ngắn hạn</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-[0.98]",
                  formData.type === 'PAYABLE'
                    ? "bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20"
                    : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  editingDebtId ? "Lưu thay đổi" : "Tạo khoản nợ mới"
                )}
              </Button>

              {editingDebtId && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold uppercase tracking-widest text-[10px] border border-red-500/20 transition-all"
                >
                  Xóa khoản nợ
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Thao tác nợ (Trả nợ / Trả lãi / Nhận tiền) */}
      <Dialog 
        open={opModal.isOpen} 
        onOpenChange={(open) => setOpModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-white/10 rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              {opModal.isPrincipal 
                ? (opModal.debtType === 'BORROW' ? 'Trả nợ gốc' : 'Nhận tiền') 
                : 'Trả lãi'}
            </DialogTitle>
            <p className="text-sm text-white/40">{opModal.debtName}</p>
          </DialogHeader>

          <form onSubmit={handleOpSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="opAmount" className="text-xs font-bold uppercase tracking-widest text-white/40">Số tiền</Label>
              <div className="relative">
                <Input
                  id="opAmount"
                  placeholder="0"
                  value={opModal.amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOpModal(prev => ({ ...prev, amount: val.replace(/\B(?=(\d{3})+(?!\d))/g, '.') }));
                  }}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl text-xl font-bold text-white pl-4"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">đ</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-base transition-all active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Xác nhận'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
