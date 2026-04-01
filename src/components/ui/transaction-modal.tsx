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
import { addTransaction, getCategories } from "@/lib/actions";

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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

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

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        amount: Number(amount),
        type: type as any,
        user_id: currentUser.id,
        note: note,
        category_id: selectedCatId || undefined
      });

      toast.success(
        `Đã ghi nhận ${type === "EXPENSE" ? "Khoản Chi" : "Thu Nhập"}!`,
        { description: `${Number(amount).toLocaleString()}k bởi ${currentUser.name}` }
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
            setSelectedCatId(null);
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
            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all border ${
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
