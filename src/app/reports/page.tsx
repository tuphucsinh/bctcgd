import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo</h1>
        <p className="text-sm text-white/40 leading-relaxed">
          Tính năng đang được phát triển. Sẽ ra mắt trong phiên bản tới.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Coming Soon
        </div>
      </div>
    </div>
  );
}
