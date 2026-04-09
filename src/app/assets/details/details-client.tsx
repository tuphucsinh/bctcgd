"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/dashboard-cards";
import { Building, Bitcoin, Coins, PiggyBank, Package, Loader2, Trash2, ArrowLeft } from "lucide-react";
import { Suspense, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateAsset, sellAsset } from "@/lib/actions";
import { formatNumber, parseNumber } from "@/lib/utils";

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

function AssetDetailsContent({ allAssets }: { allAssets: Asset[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const userId = searchParams.get("userId") || "gd";

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});
  const [sellForm, setSellForm] = useState({ quantity: 0, price: 0 });

  const handleOpenModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setEditForm({
      name: asset.name,
      quantity: asset.quantity,
      purchase_price: asset.purchase_price,
      current_price: asset.current_price,
      notes: asset.notes || ""
    });
    setSellForm({
      quantity: asset.quantity,
      price: asset.current_price
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedAsset) return;
    setIsLoading(true);
    try {
       const res = await updateAsset(selectedAsset.id, {
         name: editForm.name,
         quantity: editForm.quantity,
         purchase_price: editForm.purchase_price,
         current_price: editForm.current_price,
         notes: editForm.notes
       });
       if (res.success) {
         setIsModalOpen(false);
         setSelectedAsset({
           ...selectedAsset,
           name: editForm.name || selectedAsset.name,
           quantity: editForm.quantity || selectedAsset.quantity,
           purchase_price: editForm.purchase_price || selectedAsset.purchase_price,
           current_price: editForm.current_price || selectedAsset.current_price,
           current_value: (editForm.quantity || selectedAsset.quantity) * (editForm.current_price || selectedAsset.current_price),
           notes: editForm.notes
         });
         router.refresh();
       } else {
         alert("Lỗi: " + res.error);
       }
    } catch (e) {
       const error = e as Error;
       alert("Lỗi: " + error.message);
    } finally {
       setIsLoading(false);
    }
  };

  const handleSell = async () => {
    if (!selectedAsset) return;
    if (selectedAsset.name === 'Tiền mặt') {
      alert("Không thể xóa tài sản mặc định.");
      return;
    }
    setIsLoading(true);
    try {
       const currentAssetData = {
         quantity: selectedAsset.quantity,
         current_price: selectedAsset.current_price,
         current_value: selectedAsset.current_value,
         purchase_price: selectedAsset.purchase_price,
         type: selectedAsset.type,
         name: selectedAsset.name
       };
       const res = await sellAsset(selectedAsset.id, sellForm.quantity, sellForm.price, currentAssetData, userId);
       if (res.success) {
         setIsModalOpen(false);
         // Update local state so UI responds immediately
         if (sellForm.quantity >= selectedAsset.quantity) {
           setSelectedAsset(null);
         } else {
           setSelectedAsset({
             ...selectedAsset,
             quantity: selectedAsset.quantity - sellForm.quantity,
             current_value: (selectedAsset.quantity - sellForm.quantity) * selectedAsset.current_price
           });
         }
         router.refresh();
       } else {
         alert("Lỗi: " + res.error);
       }
    } catch (e) {
       const error = e as Error;
       alert("Lỗi: " + error.message);
    } finally {
       setIsLoading(false);
    }
  };

  const filteredAssets = allAssets.filter(a => {
    if (type === 'FINANCE') return ['CASH', 'BANK', 'SAVINGS', 'INVESTMENT', 'FINANCE'].includes(a.type);
    return a.type === type;
  }).sort((a, b) => {
    if (a.name === 'Tiền mặt') return -1;
    if (b.name === 'Tiền mặt') return 1;
    return 0;
  });

  const getHeaderInfo = () => {
    switch(type) {
      case 'REAL_ESTATE': return { title: 'Bất động sản', icon: <Building className="h-6 w-6" />, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'CRYPTO': return { title: 'Crypto', icon: <Bitcoin className="h-6 w-6" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'GOLD': return { title: 'Vàng', icon: <Coins className="h-6 w-6" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case 'FINANCE': return { title: 'Tài chính', icon: <PiggyBank className="h-6 w-6" />, color: 'text-rose-400', bg: 'bg-rose-500/10' };
      default: return { title: 'Tài sản khác', icon: <Package className="h-6 w-6" />, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  const info = getHeaderInfo();
  const totalValue = filteredAssets.reduce((sum, a) => sum + Number(a.current_value), 0);

  const formatCompact = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 flex flex-col gap-8 min-h-screen">
      {/* Header - Tối giản & Responsive */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
           <span className={`p-1.5 md:p-2 rounded-xl md:rounded-2xl ${info.bg} ${info.color} shadow-inner`}>{info.icon}</span>
           <h1 className="text-xl md:text-3xl font-black text-white italic tracking-tight uppercase leading-none">{info.title}</h1>
        </div>
        
        <div className="text-right">
          <span className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 tracking-tighter leading-none">
            {formatCompact(totalValue)}
          </span>
        </div>
      </div>

      {/* List Table */}
      <SpotlightCard 
        color="rgba(255,255,255,0.03)"
        className="rounded-3xl border border-white/5 bg-[#0a0a0a]/40 shadow-xl overflow-hidden"
        noMovement={true}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                <th className="p-5 text-left">Tài sản</th>
                <th className={`p-5 text-center px-2 ${type === 'REAL_ESTATE' ? 'hidden md:table-cell' : ''}`}>
                  <span className="md:hidden">SL</span>
                  <span className="hidden md:inline">Số lượng</span>
                </th>
                <th className="p-5 text-center hidden md:table-cell">Giá mua</th>
                <th className="p-5 text-center hidden md:table-cell">Đơn giá hiện tại</th>
                <th className="p-5 text-center">Giá trị hiện tại</th>
                <th className="p-5 text-center hidden md:table-cell">Lợi nhuận</th>
                <th className="p-5 text-center hidden md:table-cell">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-sm text-white/30 italic">Chưa có dữ liệu trong danh mục này</td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="group border-b border-white/[0.02]">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <span 
                          onClick={() => asset.name !== 'Tiền mặt' && handleOpenModal(asset)}
                          className={`flex items-center gap-1.5 text-sm font-bold ${info.color} uppercase tracking-tight transition-all duration-300 whitespace-nowrap ${asset.name !== 'Tiền mặt' ? 'cursor-pointer hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]' : ''}`}
                        >
                          {asset.name}
                        </span>
                        <span className="hidden md:inline-flex items-center text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 text-white/20 uppercase tracking-tighter border border-white/5 leading-none shrink-0">
                          {asset.asset_class === 'FIXED' ? 'Cố định' : 'Lưu động'}
                        </span>
                      </div>
                    </td>
                    <td className={`p-5 text-center font-mono text-sm text-white/80 px-2 ${type === 'REAL_ESTATE' ? 'hidden md:table-cell' : ''}`}>
                      {asset.name === 'Tiền mặt' ? '—' : asset.quantity.toLocaleString('vi-VN', { maximumFractionDigits: 6 })}
                    </td>
                    <td className="p-5 text-center font-mono text-sm text-white/60 hidden md:table-cell">
                      {asset.name === 'Tiền mặt' ? '—' : asset.purchase_price.toLocaleString('vi-VN')}
                    </td>
                    <td className="p-5 text-center font-mono text-sm text-white/60 hidden md:table-cell">
                      {asset.name === 'Tiền mặt' ? '—' : asset.current_price.toLocaleString('vi-VN')}
                    </td>
                    <td className="p-5 text-center font-mono text-sm font-bold text-white">
                      {asset.current_value.toLocaleString('vi-VN')}
                    </td>
                    <td className={`p-5 text-center font-mono text-sm font-bold hidden md:table-cell ${asset.name === 'Tiền mặt' ? 'text-white/30' : (asset.current_value - (asset.quantity * asset.purchase_price) >= 0 ? 'text-emerald-400' : 'text-rose-400')}`}>
                      {asset.name === 'Tiền mặt' ? '—' : (asset.current_value - (asset.quantity * asset.purchase_price)).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-5 text-center hidden md:table-cell">
                      <span className="text-xs text-white/30 italic line-clamp-1 mx-auto max-w-[200px]">{asset.notes || "—"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Modal Sửa / Bán */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white shadow-2xl rounded-[2rem] p-6 lg:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl italic font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {selectedAsset?.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="edit" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl">
              <TabsTrigger value="edit" className="rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-blue-500 data-[state=active]:text-white">Cập nhật</TabsTrigger>
              <TabsTrigger value="sell" disabled={selectedAsset?.name === 'Tiền mặt'} className="rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-rose-500 data-[state=active]:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="hidden md:inline">Bán / Tất toán</span>
                <span className="md:hidden">Bán</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Tên tài sản</Label>
                  <Input 
                    value={editForm.name || ""} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    className="bg-white/5 border-white/10 text-white rounded-xl h-12 px-4 shadow-inner" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Số lượng</Label>
                    <Input 
                      type="number" 
                      step="0.000001"
                      value={editForm.quantity} 
                      onChange={e => setEditForm({...editForm, quantity: Number(e.target.value)})} 
                      className="bg-white/5 border-white/10 text-white font-mono rounded-xl h-12 px-4 shadow-inner" 
                    />
                  </div>
                  <div className="grid gap-2">
                     <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Giá mua</Label>
                     <Input 
                       type="text" 
                       inputMode="numeric"
                       value={formatNumber(editForm.purchase_price || 0)} 
                       onChange={e => setEditForm({...editForm, purchase_price: Number(parseNumber(e.target.value))})} 
                       className="bg-white/5 border-white/10 text-white font-mono rounded-xl h-12 px-4 shadow-inner" 
                     />
                  </div>
                </div>
                <div className="grid gap-2">
                    <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Đơn giá hiện tại</Label>
                    <div className="relative">
                      <Input 
                        type="text" 
                        inputMode="numeric"
                        value={formatNumber(editForm.current_price || 0)} 
                        onChange={e => setEditForm({...editForm, current_price: Number(parseNumber(e.target.value))})} 
                        className="bg-blue-500/10 border-blue-500/30 text-blue-400 font-mono font-bold rounded-xl h-12 pl-4 pr-10 shadow-inner" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/50 font-bold text-xs">₫</span>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Ghi chú</Label>
                    <Input 
                      value={editForm.notes || ""} 
                      onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                      className="bg-white/5 border-white/10 text-white rounded-xl h-12 px-4 shadow-inner" 
                    />
                </div>
              </div>
              <Button 
                onClick={handleUpdate} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white rounded-xl mt-4 h-12 font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                LƯU THAY ĐỔI
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="mt-6">
              <div className="py-6 px-6 bg-gradient-to-br from-rose-500/10 to-rose-900/10 border border-rose-500/20 rounded-2xl text-center space-y-6 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]">
                 <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                   <Trash2 className="w-8 h-8 text-rose-400" />
                 </div>
                 
                 <div className="text-left space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                       <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Số lượng bán</Label>
                       <Input 
                         type="number" 
                         value={sellForm.quantity} 
                         onChange={e => setSellForm({...sellForm, quantity: Number(e.target.value)})} 
                         max={selectedAsset?.quantity}
                         className="bg-white/5 border-rose-500/30 text-rose-400 font-mono font-bold rounded-xl h-12 px-4 shadow-inner focus-visible:ring-rose-500" 
                       />
                     </div>
                     <div className="grid gap-2">
                        <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Đơn giá bán</Label>
                        <Input 
                          type="text" 
                          inputMode="numeric"
                          value={formatNumber(sellForm.price)} 
                          onChange={e => setSellForm({...sellForm, price: Number(parseNumber(e.target.value))})} 
                          className="bg-white/5 border-rose-500/30 text-rose-400 font-mono font-bold rounded-xl h-12 px-4 shadow-inner focus-visible:ring-rose-500" 
                        />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-2">
                   {sellForm.quantity >= (selectedAsset?.quantity || 0) ? (
                     <p className="text-sm text-white/50 leading-relaxed font-medium">Bán toàn bộ <span className="text-white font-bold">{selectedAsset?.name}</span>. Tài sản sẽ được chuyển sang trạng thái đã bán.</p>
                   ) : (
                     <p className="text-sm text-white/50 leading-relaxed font-medium">Bán một phần <span className="text-white font-bold">{selectedAsset?.name}</span>. Số lượng sẽ giảm còn <span className="text-white font-bold">{Math.max(0, (selectedAsset?.quantity || 0) - sellForm.quantity)}</span>.</p>
                   )}
                 </div>
                 <Button 
                    onClick={handleSell} 
                    disabled={isLoading}
                    variant="destructive"
                    className="w-full bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)] rounded-xl h-12 font-black tracking-widest uppercase transition-all hover:scale-[1.02]"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                    XÁC NHẬN BÁN {sellForm.quantity >= (selectedAsset?.quantity || 0) ? "TOÀN BỘ" : "MỘT PHẦN"}
                  </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Footer / Summary - Nút Back Tối giản */}
      <div className="flex justify-end pt-4">
          <button 
            onClick={() => router.push('/assets')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
      </div>
    </div>
  );
}

export default function AssetDetailsClient({ allAssets }: { allAssets: Asset[] }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 text-white/40 italic uppercase tracking-widest">Đang tải dữ liệu...</div>}>
      <AssetDetailsContent allAssets={allAssets} />
    </Suspense>
  );
}
