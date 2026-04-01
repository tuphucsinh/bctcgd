"use client";

import { useState } from "react";
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
// import { supabase } from "@/lib/supabase";

export function TransactionModal({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: { id: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // In real app, fetch from Supabase `categories` table. Hardcoding for UI demo
  const categories =
    type === "EXPENSE"
      ? ["Ăn uống", "Di chuyển", "Hoá đơn", "Sức khoẻ", "Giải trí", "Khác"]
      : ["Lương", "Thưởng", "Kinh doanh", "Cổ tức", "Khác"];
      
  const [selectedCat, setSelectedCat] = useState(categories[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Demo logic: This is where you would insert into Supabase
      // await supabase.from('transactions').insert({
      //   amount: Number(amount),
      //   type: type,
      //   owner: currentUser.id.toUpperCase(),
      //   note: note,
      //   category_name: selectedCat, // Demo simplified (should use UUID)
      // });
      
      // Artificial delay to show loading state seamlessly
      await new Promise(r => setTimeout(r, 600)); 

      toast.success(
        `Đã ghi nhận ${type === "EXPENSE" ? "Khoản Chi" : "Thu Nhập"}!`,
        { description: `${Number(amount).toLocaleString()}k - ${selectedCat} bởi ${currentUser.name}` }
      );
      
      setOpen(false);
      setAmount("");
      setNote("");
    } catch {
      toast.error("Lỗi khi lưu giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[425px] bg-background/90 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Ghi chép Giao dịch</DialogTitle>
          <DialogDescription>
             Đang ghi sổ dưới tư cách <strong>{currentUser.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="EXPENSE" 
          className="w-full mt-2"
          onValueChange={(v) => {
            setType(v as "EXPENSE" | "INCOME");
            setSelectedCat(v === "EXPENSE" ? "Ăn uống" : "Lương");
          }}
        >
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
            <TabsTrigger value="EXPENSE" className="rounded-md data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500 transition-all">
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Chi Tiêu
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="rounded-md data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500 transition-all">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Thu Nhập
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Số tiền (VNĐ)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">đ</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-14 text-2xl font-semibold bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3"/> Hạng mục
            </Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all border ${
                    selectedCat === cat 
                      ? type === "EXPENSE"
                        ? "bg-orange-500/10 border-orange-500/50 text-orange-400" 
                        : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                      : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat}
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
