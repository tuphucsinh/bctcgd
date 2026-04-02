import { getDebts } from "@/lib/actions";
import { DebtClient } from "./debt-client";

export const revalidate = 0; // Luôn fetch mới cho Realtime

export default async function DebtsPage() {
  const debts = await getDebts();

  return (
    <div className="mx-auto max-w-5xl py-8">
      <DebtClient initialDebts={debts || []} />
    </div>
  );
}
