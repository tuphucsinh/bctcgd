'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

type HistoryItem = {
  id: string;
  action: 'MUA' | 'BÁN' | 'CẬP NHẬT';
  name: string;
  type: string;
  amount: number;
  quantity: number | null;
  price: number | null;
  date: string;
  note: string;
};

export default function HistoryClient({ data }: { data: HistoryItem[] }) {
  const router = useRouter();

  const getActionColor = (action: string) => {
    switch (action) {
      case 'MUA': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'BÁN': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'CẬP NHẬT': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8 font-sans selection:bg-white/20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div className="flex items-center justify-between group">
          <button 
            onClick={() => router.push('/assets')}
            className="flex items-center text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Quay lại</span>
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-12 text-gray-600 bg-[#0a0a0a] rounded-2xl border border-white/5">
              <p className="text-sm">Chưa có lịch sử thao tác</p>
            </div>
          ) : (
            data.map((item) => (
              <div 
                key={item.id}
                className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  
                  {/* Left segment */}
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white/90">{item.name || 'Tài sản'}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getActionColor(item.action)} uppercase font-bold tracking-wider`}>
                          {item.action}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span>
                          {new Date(item.date).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {item.note && (
                        <p className="mt-1.5 text-xs text-gray-600 italic">
                          &quot;{item.note}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right segment */}
                  <div className="flex flex-col items-end text-right">
                    <div className="text-lg font-medium tracking-tight">
                      {item.action === 'BÁN' ? (
                        <span className="text-emerald-400">
                          {formatNumber(item.amount)}
                        </span>
                      ) : (
                        <span className="text-blue-400">
                          {formatNumber(item.amount)}
                        </span>
                      )}
                    </div>
                    {item.quantity && item.price && (
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {formatNumber(item.quantity)} × {formatNumber(item.price)}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
