"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Plus, ArrowDownRight, ArrowUpRight, User, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { createDebt, type DebtInput } from "@/lib/actions";
import { useRouter } from "next/navigation";

const OWNER_BADGES = {
  JOINT: { label: "Chung", icon: Users },
  HIEU: { label: "Hiếu", icon: User },
  LY: { label: "Ly", icon: User },
};

export function DebtClient({ initialDebts }: { initialDebts: Record<string, any>[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<DebtInput>({
    name: "",
    debtor_creditor: "",
    type: "PAYABLE",
    original_principal: 0,
    remaining_principal: 0,
    start_date: new Date().toISOString().split('T')[0],
    owner: "JOINT"
  });

  const payables = initialDebts.filter(d => d.type === 'PAYABLE');
  const receivables = initialDebts.filter(d => d.type === 'RECEIVABLE');

  const totalPayable = payables.reduce((sum, d) => sum + Number(d.remaining_principal), 0);
  const totalReceivable = receivables.reduce((sum, d) => sum + Number(d.remaining_principal), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await createDebt({
        ...formData,
        remaining_principal: formData.original_principal // Khi mới tạo, nợ còn lại = nợ gốc
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

  const renderDebtCard = (debt: any) => {
    const original = Number(debt.original_principal);
    const remaining = Number(debt.remaining_principal);
    const paid = original - remaining;
    const progress = (paid / original) * 100;
    const isPayable = debt.type === 'PAYABLE';

    return (
      <div key={debt.id} className="group rounded-2xl bg-card p-5 border border-border/30 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isPayable ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {isPayable ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-base line-clamp-1">{debt.name}</h3>
              <p className="text-xs text-muted-foreground">{isPayable ? "Chủ nợ:" : "Con nợ:"} {debt.debtor_creditor}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Còn lại:</span>
            <span className="font-bold text-lg">{formatCurrency(remaining)}</span>
          </div>
          <Progress value={progress} className={`h-2 ${isPayable ? 'bg-orange-500/20' : 'bg-emerald-500/20'}`} />
          <div className="flex justify-between text-xs mt-2 text-muted-foreground">
            <span>Đã {isPayable ? 'trả' : 'thu'}: {formatCurrency(paid)}</span>
            <span>Tổng: {formatCurrency(original)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="w-full text-xs">Chi tiết</Button>
          <Button size="sm" className="w-full text-xs">{isPayable ? 'Trả nợ' : 'Nhận tiền'}</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Công Nợ</h1>
          <p className="text-muted-foreground mt-1">Theo dõi các khoản tiền vay và cho vay.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="inline-flex w-full sm:w-auto h-11 items-center justify-center px-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all text-sm font-medium">
            <Plus className="mr-2 h-5 w-5" /> Thêm Giao Dịch
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Thêm Khoản Nợ / Cho Vay</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Loại giao dịch</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as DebtInput['type']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYABLE">Mình đi vay (Nợ)</SelectItem>
                      <SelectItem value="RECEIVABLE">Cho người khác vay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Thuộc về</Label>
                  <Select value={formData.owner} onValueChange={(v) => setFormData({...formData, owner: v as DebtInput['owner']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JOINT">Cả Hai</SelectItem>
                      <SelectItem value="HIEU">Hiếu</SelectItem>
                      <SelectItem value="LY">Ly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Mục đích / Tên khoản nợ</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="Vd: Vay mua xe máy..." 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="debtor_creditor">{formData.type === 'PAYABLE' ? 'Chủ nợ (Vay của ai)' : 'Con nợ (Cho ai vay)'}</Label>
                <Input 
                  id="debtor_creditor" 
                  value={formData.debtor_creditor}
                  onChange={(e) => setFormData({...formData, debtor_creditor: e.target.value})}
                  required 
                  placeholder="Vd: Ngân hàng VCB, Anh A..." 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="original_principal">Số tiền gốc</Label>
                <Input 
                  id="original_principal" 
                  type="number" 
                  value={formData.original_principal || ""}
                  onChange={(e) => setFormData({...formData, original_principal: Number(e.target.value)})}
                  required 
                  placeholder="0 đ" 
                />
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={isLoading || !formData.name}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu Khoản Nợ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-card p-6 border border-orange-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent z-0" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Tổng Nợ Phải Trả</p>
            <h2 className="text-3xl font-black tracking-tight">{formatCurrency(totalPayable)}</h2>
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 border border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent z-0" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Tổng Tiền Cho Vay</p>
            <h2 className="text-3xl font-black tracking-tight">{formatCurrency(totalReceivable)}</h2>
          </div>
        </div>
      </div>

      <Tabs defaultValue="payable" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
          <TabsTrigger value="payable" className="data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600">
            Nợ cần trả ({payables.length})
          </TabsTrigger>
          <TabsTrigger value="receivable" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">
            Cho vay ({receivables.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="payable">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payables.length === 0 ? (
               <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                 <p className="text-muted-foreground font-medium">Không có khoản nợ nào</p>
               </div>
            ) : payables.map(renderDebtCard)}
          </div>
        </TabsContent>
        <TabsContent value="receivable">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receivables.length === 0 ? (
               <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                 <p className="text-muted-foreground font-medium">Không có khoản cho vay nào</p>
               </div>
            ) : receivables.map(renderDebtCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
