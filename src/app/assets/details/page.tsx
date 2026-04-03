import { getAssets } from "@/lib/actions";
import AssetDetailsClient from "./details-client";

export const revalidate = 0;

export default async function AssetDetailsPage() {
  const assets = await getAssets();

  return (
    <div className="mx-auto max-w-7xl">
       <AssetDetailsClient allAssets={assets || []} />
    </div>
  );
}
