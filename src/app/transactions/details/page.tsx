import { Suspense } from "react";
import { TransactionDetailsClient } from "./details-client";

export default function TransactionDetailsPage({
  searchParams,
}: {
  searchParams: { user?: string };
}) {
  const userId = searchParams.user || "all";

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
      </div>
    }>
      <TransactionDetailsClient initialUserId={userId} />
    </Suspense>
  );
}
