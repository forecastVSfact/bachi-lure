import { LureCard } from "@/components/LureCard";
import { LureFilters } from "@/components/LureFilters";
import { getLures } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "ルアー一覧",
  description:
    "バチ抜け向けシーバスルアー一覧。川バチ・港湾バチ・クルクルバチ・底バチで絞り込み、サイズ・速度域・飛距離から比較できます。",
  path: "/lures"
});

export default async function LuresPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const lures = await getLures({
    bachi: searchParams.bachi,
    type: searchParams.type,
    speed: searchParams.speed,
    casting: searchParams.casting,
    q: searchParams.q
  });

  return (
    <div>
      <h1 className="serif-title mb-6 text-3xl font-bold">ルアー一覧</h1>
      <LureFilters />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {lures.map((lure) => (
          <LureCard key={lure.id} lure={lure} />
        ))}
      </div>
    </div>
  );
}

