"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addTransaction, getCategories } from "@/lib/actions";

const users = [
  { id: "hieu", name: "Hiếu", color: "bg-blue-500" },
  { id: "ly", name: "Ly", color: "bg-pink-500" }
];

export function TransactionModal({
  children,
  currentUser,
  defaultType = "EXPENSE",
}: {
  children: React.ReactNode;
  currentUser: { id: string; name?: string };
  defaultType?: "EXPENSE" | "INCOME";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Xử lý fallback cho user
  const initialUser = {
    id: currentUser.id === 'all' ? 'hieu' : currentUser.id,
    name: currentUser.name || (currentUser.id === 'ly' ? 'Ly' : 'Hiếu')
  };

  const [activeUser, setActiveUser] = useState(initialUser);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">(defaultType);
  const [categories, setCategories] = useState<{id: string; name: string; type: string}[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveUser({
        id: currentUser.id === 'all' ? 'hieu' : currentUser.id,
        name: currentUser.name || (currentUser.id === 'ly' ? 'Ly' : 'Hiếu')
      });
    }
  }, [open, currentUser]);

  useEffect(() => {
    if (open) {
      setType(defaultType);
    }
  }, [open, defaultType]);

  useEffect(() => {
    async function loadCats() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    loadCats();
  }, []);

  const incomeOrder = ["Lương", "Thưởng", "Bất động sản", "Cổ tức", "Tài chính", "Khác"];
  const expenseOrder = ["Ăn uống", "Di chuyển", "Hóa đơn", "Giao tế", "Giải trí", "Đồ dùng", "Sức khỏe", "Học hành", "Con cái", "Khác"];

  const filteredCategories = categories
    .filter(c => c.type === type)
    .sort((a, b) => {
      const order = type === "INCOME" ? incomeOrder : expenseOrder;
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.name.localeCompare(b.name);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    const numericAmount = Number(amount);
    
    try {
      const result = await addTransaction({
        amount: numericAmount,
        type: type,
        user_id: activeUser.id,
        note: note || `Ghi chép ${type === 'INCOME' ? 'thu nhập' : 'chi tiêu'}`,
        category_id: selectedCatId || undefined
      });

      if (!result.success) {
        toast.error(result.error || "Không thể lưu giao dịch");
        return;
      }

      toast.success(
        `Đã ghi nhận ${type === "EXPENSE" ? "Khoản Chi" : "Thu Nhập"}!`,
        { description: `${numericAmount.toLocaleString()}đ bởi ${activeUser.name}` }
      );
      
      setOpen(false);
      setAmount("");
      setNote("");
      setSelectedCatId(null);
      // Refresh page to show new data
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu giao dịch.");
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
      <DialogContent className="sm:max-w-[400px] max-h-[95vh] flex flex-col bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl px-6 pb-6 pt-4 overflow-y-auto custom-scrollbar">
        <div className="flex-shrink-0 flex items-center justify-center mb-2">
          <div className="flex p-0.5 rounded-full bg-muted/40 backdrop-blur-md border border-white/5">
            {users.map((u) => {
              const isActive = activeUser.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setActiveUser(u)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1 rounded-full transition-all text-xs font-semibold relative overflow-hidden",
                    isActive 
                      ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20" 
                      : "text-white/15 hover:text-white/40 hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    u.color,
                    isActive ? "shadow-[0_0_10px_currentColor]" : "opacity-20"
                  )} />
                  {u.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thay thế Tabs library bằng custom flex container để tránh border lồng nhau */}
        <div className="flex-shrink-0 w-full mb-4 p-1 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl h-12 flex items-center justify-between shadow-inner">
          <button
            type="button"
            onClick={() => {
              setType("EXPENSE");
              setSelectedCatId(null);
            }}
            className={cn(
              "flex-1 h-full rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm",
              type === "EXPENSE" 
                ? "bg-orange-500/20 text-orange-500 shadow-none border-none outline-none" 
                : "text-white/20 hover:text-white/40"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              type === "EXPENSE" ? "bg-orange-500/10" : "bg-white/5"
            )}>
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            Chi Tiêu
          </button>
          <button
            type="button"
            onClick={() => {
              setType("INCOME");
              setSelectedCatId(null);
            }}
            className={cn(
              "flex-1 h-full rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm",
              type === "INCOME" 
                ? "bg-emerald-500/20 text-emerald-500 shadow-none border-none outline-none" 
                : "text-white/20 hover:text-white/40"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              type === "INCOME" ? "bg-emerald-500/10" : "bg-white/5"
            )}>
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            Thu Nhập
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex-shrink-0 space-y-1.5">
            <Label htmlFor="amount" className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Số tiền (VNĐ)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">đ</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-12 text-xl font-bold bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Input
              id="note"
              placeholder="Ghi chú thêm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12 bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0 space-y-1.5 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 overflow-y-auto pr-1 py-1 custom-scrollbar">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex items-center justify-center h-10 px-1 text-[10px] font-semibold rounded-xl transition-all border text-center ${
                    selectedCatId === cat.id 
                      ? type === "EXPENSE"
                        ? "bg-orange-500/10 border-orange-500/50 text-orange-400" 
                        : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                      : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              type === "EXPENSE" ? "bg-orange-600 hover:bg-orange-500" : "bg-emerald-600 hover:bg-emerald-500"
            } ${loading ? "opacity-70 pointer-events-none" : ""}`}
          >
            {loading ? (
              <span className="animate-pulse">Đang lưu...</span>
            ) : (
              <>
                <Plus className="w-5 h-5"/>
                Lưu {type === "EXPENSE" ? "Khoản Chi" : "Thu Nhập"}
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
