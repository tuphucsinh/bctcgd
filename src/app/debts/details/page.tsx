import { getDebts } from "@/lib/actions";
import DebtDetailsClient from "./details-client";

export const revalidate = 0;

export default async function DebtDetailsPage() {
  const debts = await getDebts();

  return (
    <div className="mx-auto max-w-7xl">
       <DebtDetailsClient allDebts={debts || []} />
    </div>
  );
}
