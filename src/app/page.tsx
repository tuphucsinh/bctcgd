import { Suspense } from "react";
import { getFinancialSummary, getMonthlyTrend } from "@/lib/actions";
import { DashboardClient } from "./dashboard-client";

// Áp dụng Caching Strategy (Pending Refactor #5)
// Cho phép cache layout dashboard và revalidate mỗi 60 giây để giảm tải DB
export const revalidate = 60;

export default async function Home() {
  // Fetch data on the server to prevent flickering
  const [summary, trend] = await Promise.all([
    getFinancialSummary('all'),
    getMonthlyTrend('all')
  ]);

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Đang tải Dashboard...</div>}>
      <DashboardClient 
        initialSummary={summary} 
        initialTrend={trend || []} 
      />
    </Suspense>
  );
}
