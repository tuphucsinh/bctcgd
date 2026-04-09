import { getSettings } from "@/lib/actions/settings";
import SettingsClient from "./settings-client";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
          Cài đặt <span className="text-primary">hệ thống</span>
        </h1>
        <p className="text-white/40 text-sm font-medium mt-1 uppercase tracking-widest">
          Thiết lập mục tiêu và quản lý dữ liệu gia đình
        </p>
      </header>
      
      <SettingsClient initialSettings={settings} />
    </div>
  );
}
