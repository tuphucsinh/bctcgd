"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Plus, Wallet, Building2, PiggyBank, Landmark, User, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAsset, type AssetInput } from "@/lib/actions";
import { useRouter } from "next/navigation";

const TYPE_ICONS = {
  CASH: Wallet,
  BANK: Building2,
  SAVINGS: PiggyBank,
  INVESTMENT: Landmark,
};

const OWNER_BADGES = {
  JOINT: { label: "Chung", icon: Users, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  HIEU: { label: "Hiếu", icon: User, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  LY: { label: "Ly", icon: User, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

export function AssetClient({ initialAssets }: { initialAssets: Record<string, any>[] }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await createAsset(formData);
      setIsOpen(false);
      router.refresh(); // Refresh RSC để load data mới
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Tính tổng
  const totalAssets = initialAssets.reduce((sum, a) => sum + Number(a.current_value), 0);
  const hieuAssets = initialAssets.filter(a => a.owner === 'HIEU').reduce((sum, a) => sum + Number(a.current_value), 0);
  const lyAssets = initialAssets.filter(a => a.owner === 'LY').reduce((sum, a) => sum + Number(a.current_value), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tài sản gia đình</h1>
          <p className="text-muted-foreground mt-1">Quản lý các khoản tiền, sổ tiết kiệm và đầu tư.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="inline-flex w-full sm:w-auto h-11 items-center justify-center px-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all text-sm font-medium">
            <Plus className="mr-2 h-5 w-5" /> Thêm Tài Khoản
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Thêm Tài Khoản Mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên tài khoản (Ví dụ: Tiền mặt, Thẻ TD VCB)</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="Nhập tên tài khoản..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Loại tài khoản</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as AssetInput['type']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tiền mặt</SelectItem>
                      <SelectItem value="BANK">Thẻ ngân hàng</SelectItem>
                      <SelectItem value="SAVINGS">Sổ tiết kiệm</SelectItem>
                      <SelectItem value="INVESTMENT">Đầu tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Thuộc về</Label>
                  <Select value={formData.owner} onValueChange={(v) => setFormData({...formData, owner: v as AssetInput['owner']})}>
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
                <Label htmlFor="current_value">Số dư ban đầu</Label>
                <Input 
                  id="current_value" 
                  type="number" 
                  value={formData.current_value || ""}
                  onChange={(e) => setFormData({...formData, current_value: Number(e.target.value)})}
                  required 
                  placeholder="0 đ" 
                />
              </div>
              <Button type="submit" className="mt-2 w-full shadow-md" disabled={isLoading || !formData.name}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Thêm Tài Khoản"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-card p-6 border border-border/10 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground mb-1">Tổng tài sản chung</p>
            <h2 className="text-4xl font-black tracking-tight">{formatCurrency(totalAssets)}</h2>
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 border border-border/10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent z-0" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground mb-1">Của Hiếu</p>
            <h2 className="text-3xl font-bold">{formatCurrency(hieuAssets)}</h2>
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 border border-border/10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent z-0" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground mb-1">Của Ly</p>
            <h2 className="text-3xl font-bold">{formatCurrency(lyAssets)}</h2>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <h2 className="text-xl font-bold mt-8 mb-4">Danh sách Tài Khoản</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialAssets.map((asset) => {
          const Icon = TYPE_ICONS[asset.type as keyof typeof TYPE_ICONS] || Wallet;
          const ownerBadge = OWNER_BADGES[asset.owner as keyof typeof OWNER_BADGES];

          return (
            <div key={asset.id} className="group relative rounded-2xl bg-card p-5 border border-border/30 hover:border-border transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base line-clamp-1">{asset.name}</h3>
                    <p className="text-xs text-muted-foreground">{asset.bank_name || asset.type}</p>
                  </div>
                </div>
                {ownerBadge && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${ownerBadge.color}`}>
                    <ownerBadge.icon className="h-3 w-3" /> {ownerBadge.label}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xl font-bold mt-2">{formatCurrency(Number(asset.current_value))}</p>
              </div>
            </div>
          );
        })}
        {initialAssets.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">Chưa có tài khoản nào</p>
            <Button variant="link" onClick={() => setIsOpen(true)}>Thêm tài khoản đầu tiên</Button>
          </div>
        )}
      </div>
    </div>
  );
}
