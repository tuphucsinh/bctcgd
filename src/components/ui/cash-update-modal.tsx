"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCashAmount } from "@/lib/actions";

export function CashUpdateModal({
  children,
  currentCash,
  userId,
}: {
  children: React.ReactNode;
  currentCash: number;
  userId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Format input value tracking
  const [displayAmount, setDisplayAmount] = useState(
    currentCash ? currentCash.toLocaleString('vi-VN') : ""
  );

  // P1-4: Sync giá trị mới nhất mỗi lần modal mở
  useEffect(() => {
    if (open) {
      setDisplayAmount(currentCash ? currentCash.toLocaleString('vi-VN') : "");
    }
  }, [open, currentCash]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ giữ lại số
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setDisplayAmount("");
      return;
    }
    // Format lại thành số có phân cách hàng ngàn
    const num = parseInt(rawValue, 10);
    setDisplayAmount(num.toLocaleString('vi-VN'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawValue = displayAmount.replace(/[^0-9]/g, "");
    const numericAmount = parseInt(rawValue, 10);

    if (isNaN(numericAmount) || numericAmount < 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    
    try {
      const result = await updateCashAmount(numericAmount, userId);

      if (!result.success) {
        toast.error(result.error || "Không thể cập nhật Tiền mặt");
        return;
      }

      toast.success(
        "Cập nhật thành công!",
        { description: `Tiền mặt hiện tại: ${numericAmount.toLocaleString('vi-VN')}đ` }
      );
      
      setOpen(false);
      router.refresh(); // P2-1: Không full reload, giữ client state
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật Tiền mặt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <div {...props} className="cursor-pointer">
            {children}
          </div>
        )}
      />
      <DialogContent className="sm:max-w-[400px] max-h-[95vh] flex flex-col bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl px-6 pb-6 pt-6 overflow-y-auto custom-scrollbar rounded-3xl">
        <div className="flex-shrink-0 w-full mb-6 text-center">
         <h2 className="text-xl font-bold text-white tracking-tight">Cập nhật Tiền mặt</h2>
         <p className="text-sm text-muted-foreground mt-1">Ghi nhận số dư tiền mặt hiện tại của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
          <div className="flex-shrink-0 space-y-2">
            <Label htmlFor="amount" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider ml-1">Số dư (VNĐ)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">đ</span>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountChange}
                className="pl-8 h-14 text-2xl font-bold bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-2xl"
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-semibold text-white/70 bg-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98] border border-white/5"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]",
                loading && "opacity-70 pointer-events-none"
              )}
            >
              {loading ? (
                <span className="animate-pulse flex flex-row items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Đang lưu...
                </span>
              ) : (
                <>
                  <Save className="w-5 h-5"/>
                  Lưu
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
