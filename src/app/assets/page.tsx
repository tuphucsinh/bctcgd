import { getAssets } from "@/lib/actions";
import { AssetClient } from "./asset-client";

export const revalidate = 0; // Luôn fetch mới (Dùng cho ứng dụng cần realtime)

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <div className="mx-auto max-w-5xl py-8">
      <AssetClient initialAssets={assets || []} />
    </div>
  );
}
