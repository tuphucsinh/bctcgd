"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/dashboard-cards";
import { ArrowLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

interface Debt {
  id: string;
  name: string;
  debt_type: 'BORROW' | 'LEND';
  debtor_creditor: string;
  amount: number;
  remaining_amount: number;
  start_date: string;
  owner: 'HIEU' | 'LY';
  status: string;
}

function DebtDetailsContent({ allDebts }: { allDebts: Debt[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get("type") as 'PAYABLE' | 'RECEIVABLE' || 'PAYABLE';
  const targetType = typeParam === 'PAYABLE' ? 'BORROW' : 'LEND';

  const filteredDebts = allDebts.filter(d => d.debt_type === targetType);
  
  const isPayable = typeParam === 'PAYABLE';
  const info = {
    title: isPayable ? 'Nợ phải trả' : 'Khoản cho vay',
    icon: isPayable ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />,
    color: isPayable ? 'text-orange-400' : 'text-emerald-400',
    bg: isPayable ? 'bg-orange-500/10' : 'bg-emerald-500/10'
  };

  const totalValue = filteredDebts.reduce((sum, d) => sum + Number(d.remaining_amount), 0);

  const formatCompact = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 flex flex-col gap-8 min-h-screen">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
           <span className={cn("p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-inner", info.bg, info.color)}>{info.icon}</span>
           <h1 className="text-xl md:text-3xl font-black text-white italic tracking-tight uppercase leading-none">{info.title}</h1>
        </div>
        
        <div className="text-right">
          <span className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 tracking-tighter leading-none">
            {formatCompact(totalValue)}
          </span>
        </div>
      </div>

      <SpotlightCard 
        color="rgba(255,255,255,0.03)"
        className="rounded-3xl border border-white/5 bg-[#0a0a0a]/40 shadow-xl overflow-hidden"
        noMovement={true}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                <th className="p-5 text-left">Tên khoản</th>
                <th className="p-5 text-center">{isPayable ? "Chủ nợ" : "Con nợ"}</th>
                <th className="p-5 text-center hidden md:table-cell">Gốc</th>
                <th className="p-5 text-center">Còn lại</th>
                <th className="p-5 text-center hidden md:table-cell">Đã {isPayable ? "trả" : "thu"}</th>
                <th className="p-5 text-center hidden md:table-cell">Ngày vay</th>
                <th className="p-5 text-center hidden md:table-cell">Chủ sở hữu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-sm text-white/30 italic">Chưa có dữ liệu</td>
                </tr>
              ) : (
                filteredDebts.map((debt) => {
                  const original = Number(debt.amount);
                  const remaining = Number(debt.remaining_amount);
                  const paid = original - remaining;
                  
                  return (
                    <tr key={debt.id} className="group border-b border-white/[0.02]">
                      <td className="p-5">
                        <span className={cn("text-sm font-bold uppercase tracking-tight transition-all duration-300", info.color)}>
                          {debt.name}
                        </span>
                      </td>
                      <td className="p-5 text-center text-sm text-white/70">
                        {debt.debtor_creditor}
                      </td>
                      <td className="p-5 text-center font-mono text-sm text-white/40 hidden md:table-cell">
                        {original.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-5 text-center font-mono text-sm font-bold text-white">
                        {remaining.toLocaleString('vi-VN')}
                      </td>
                      <td className={cn("p-5 text-center font-mono text-sm font-bold hidden md:table-cell", info.color)}>
                        {paid.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-5 text-center text-xs text-white/30 hidden md:table-cell">
                        {new Date(debt.start_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-5 text-center hidden md:table-cell">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/5 text-white/20 uppercase tracking-tighter border border-white/5">
                          {debt.owner === 'HIEU' ? 'Hiếu' : 'Ly'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      <div className="flex justify-end pt-4">
          <button 
            onClick={() => router.push('/debts')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
      </div>
    </div>
  );
}

export default function DebtDetailsClient({ allDebts }: { allDebts: Debt[] }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 text-white/40 italic uppercase tracking-widest">Đang tải dữ liệu...</div>}>
      <DebtDetailsContent allDebts={allDebts} />
    </Suspense>
  );
}
