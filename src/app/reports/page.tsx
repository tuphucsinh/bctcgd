import { ReportsClient } from './reports-client';
import { getMonthlyCashflow, getExpensesByCategory, getReportSummary } from '@/lib/actions/reports';

export const metadata = {
  title: 'Báo cáo | BCTCGD',
  description: 'Thống kê và báo cáo tài chính cá nhân',
};

// Hàm lấy ngày đầu tháng hiện tại (VN Time)
function getVNStartOfMonth(): string {
  const now = new Date();
  const vnDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  vnDate.setDate(1);
  const year = vnDate.getFullYear();
  const month = String(vnDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

// Hàm lấy ngày hiện tại (VN Time)
function getVNToday(): string {
  const now = new Date();
  const vnDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vnDate.getFullYear();
  const month = String(vnDate.getMonth() + 1).padStart(2, '0');
  const day = String(vnDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function ReportsPage() {
  const startDate = getVNStartOfMonth();
  const endDate = getVNToday();

  // Fetch all report data in parallel
  const [summary, monthlyCashflow, expensesByCategory] = await Promise.all([
    getReportSummary(),
    getMonthlyCashflow(6),
    getExpensesByCategory(startDate, endDate)
  ]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <ReportsClient 
        summary={summary}
        monthlyCashflow={monthlyCashflow}
        expensesByCategory={expensesByCategory}
      />
    </div>
  );
}
