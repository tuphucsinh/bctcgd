'use client';

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  Settings as SettingsIcon,
  Database,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, parseNumber } from '@/lib/utils';
import { AppSettings, updateSettings, exportDatabase, importDatabase } from '@/lib/actions/settings';
import { toast } from 'sonner';

export default function SettingsClient({ initialSettings }: { initialSettings: AppSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    const result = await updateSettings(settings);
    setIsLoading(false);
    if (result.success) {
      toast.success('Đã lưu cài đặt mục tiêu tài chính.');
    } else {
      toast.error('Lỗi khi lưu cài đặt.');
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const json = await exportDatabase();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bctcgd_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Đã xuất dữ liệu thành công.');
    } catch (e) {
      toast.error('Lỗi khi xuất dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('CẢNH BÁO: Hành động này sẽ XÓA TOÀN BỘ dữ liệu hiện tại và thay thế bằng dữ liệu từ file sao lưu. Bạn có chắc chắn muốn tiếp tục?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const result = await importDatabase(content);
        if (result.success) {
          toast.success('Đã khôi phục dữ liệu thành công. Trang web sẽ tải lại.');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          toast.error('Lỗi khi nhập dữ liệu. Vui lòng kiểm tra định dạng file.');
        }
      };
      reader.readAsText(file);
    } catch (e) {
      toast.error('Lỗi khi đọc file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
          <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-xs px-6 py-2.5">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Thiết lập mục tiêu
          </TabsTrigger>
          <TabsTrigger value="backup" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-xs px-6 py-2.5">
            <Database className="w-4 h-4 mr-2" />
            Sao lưu dữ liệu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="space-y-2">
                <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Mục tiêu thu nhập tháng</Label>
                <div className="relative group">
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(settings.target_income)}
                    onChange={(e) => setSettings({...settings, target_income: Number(parseNumber(e.target.value))})}
                    className="bg-white/5 border-white/10 text-xl font-mono font-bold text-emerald-400 h-14 rounded-2xl focus:ring-emerald-500/50 focus:border-emerald-500"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/20 font-black italic">VND</div>
                </div>
                <p className="text-[10px] text-white/20 italic">Số tiền thu nhập bạn kỳ vọng đạt được mỗi tháng.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Ngân sách chi tiêu tháng</Label>
                <div className="relative group">
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(settings.target_spending)}
                    onChange={(e) => setSettings({...settings, target_spending: Number(parseNumber(e.target.value))})}
                    className="bg-white/5 border-white/10 text-xl font-mono font-bold text-rose-400 h-14 rounded-2xl focus:ring-rose-500/50 focus:border-rose-500"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400/20 font-black italic">VND</div>
                </div>
                <p className="text-[10px] text-white/20 italic">Hạn mức chi tiêu tối đa bạn mong muốn trong tháng.</p>
              </div>

              <Button 
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-[1.02]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu cài đặt mục tiêu
              </Button>
            </div>

            <div className="flex flex-col justify-center p-8 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-3xl space-y-4">
              <CheckCircle2 className="w-12 h-12 text-primary" />
              <h3 className="text-xl font-bold text-white">Tại sao cần thiết lập?</h3>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Việc thiết lập mục tiêu giúp hệ thống tính toán tỷ lệ hoàn thành (Thu nhập) và cảnh báo vượt ngưỡng (Chi tiêu) ngay trên Dashboard của bạn, giúp bạn quản lý dòng tiền kỉ luật hơn.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <div className="grid gap-6 md:grid-cols-2">
             {/* Export Card */}
             <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6 group hover:border-emerald-500/30 transition-all duration-500">
               <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Download className="w-7 h-7 text-emerald-400" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white mb-2">Xuất dữ liệu</h3>
                 <p className="text-sm text-white/40 leading-relaxed">Tải trọn bộ dữ liệu tài chính (Giao dịch, Tài sản, Nợ) về máy tính dưới định dạng file JSON để lưu trữ cá nhân.</p>
               </div>
               <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={isLoading}
                className="w-full border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all font-bold uppercase tracking-widest text-xs h-12 rounded-xl"
               >
                 Tải file sao lưu (.json)
               </Button>
             </div>

             {/* Import Card */}
             <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6 group hover:border-rose-500/30 transition-all duration-500">
               <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Upload className="w-7 h-7 text-rose-400" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white mb-2">Khôi phục dữ liệu</h3>
                 <p className="text-sm text-white/40 leading-relaxed">Nhập dữ liệu từ file sao lưu. <span className="text-rose-400 font-bold italic underline">Lưu ý: Hành động này sẽ ghi đè hoàn toàn dữ liệu cũ trên máy chủ.</span></p>
               </div>
               <div className="relative">
                 <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".json"
                  className="hidden" 
                 />
                 <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold uppercase tracking-widest text-xs h-12 rounded-xl"
                 >
                   Chọn file và Khôi phục
                 </Button>
               </div>
             </div>
          </div>

          <div className="mt-8 p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex gap-4 items-start">
             <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
             <div className="space-y-1">
               <h4 className="text-sm font-bold text-rose-200 uppercase tracking-wider">Lưu ý an toàn:</h4>
               <p className="text-xs text-rose-500/60 leading-relaxed">Chúng tôi khuyên bạn nên xuất dữ liệu (Export) định kỳ hàng tuần. File sao lưu chứa thông tin tài chính nhạy cảm, vui lòng bảo quản file này ở nơi an toàn.</p>
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
