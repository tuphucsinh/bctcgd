"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, ArrowUpCircle, Plus, Calendar, Tag } from "lucide-react";
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
  currentUser: { id: string; name: string };
  defaultType?: "EXPENSE" | "INCOME";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(currentUser);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">(defaultType);
  const [categories, setCategories] = useState<{id: string; name: string; type: string}[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveUser(currentUser);
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
    try {
      await addTransaction({
        amount: numericAmount,
        type: type,
        owner: activeUser.id,
        note: note || `Ghi chép ${type === 'INCOME' ? 'thu nhập' : 'chi tiêu'}`,
        category_id: selectedCatId || undefined
      });

      toast.success(
        `Đã ghi nhận ${type === "EXPENSE" ? "Khoản Chi" : "Thu Nhập"}!`,
        { description: `${numericAmount.toLocaleString()}k bởi ${activeUser.name}` }
      );
      
      setOpen(false);
      setAmount("");
      setNote("");
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
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] h-[600px] flex flex-col bg-background/90 backdrop-blur-xl border-border/50 shadow-2xl p-6 pt-10 overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-center mb-4">
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

        <Tabs 
          value={type} 
          className="flex-shrink-0 w-full mb-4"
          onValueChange={(v) => {
            setType(v as "EXPENSE" | "INCOME");
            setSelectedCatId(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2 p-1.5 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl h-14 shadow-inner">
            <TabsTrigger 
              value="EXPENSE" 
              className="rounded-xl h-full data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500 data-[state=active]:shadow-[0_0_15px_rgba(249,115,22,0.15)] data-[state=active]:border data-[state=active]:border-orange-500/30 transition-all text-sm font-bold gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <ArrowDownCircle className="w-5 h-5" />
              </div>
              Chi Tiêu
            </TabsTrigger>
            <TabsTrigger 
              value="INCOME" 
              className="rounded-xl h-full data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500 data-[state=active]:shadow-[0_0_15px_rgba(16,185,129,0.15)] data-[state=active]:border data-[state=active]:border-emerald-500/30 transition-all text-sm font-bold gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              Thu Nhập
            </TabsTrigger>
          </TabsList>
        </Tabs>

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

          <div className="flex-1 flex flex-col min-h-0 space-y-1.5 overflow-hidden">
            <Label className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3"/> Hạng mục
            </Label>
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

          <div className="space-y-2">
            <Label htmlFor="note" className="text-muted-foreground text-xs font-medium uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3"/> Ghi chú thêm
            </Label>
            <Input
              id="note"
              placeholder="Ví dụ: Cơm trưa công ty..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12 bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
            />
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
