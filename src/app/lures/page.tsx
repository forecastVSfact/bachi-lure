import { LureCard } from "@/components/LureCard";
import { LureFilters } from "@/components/LureFilters";
import { getLures } from "@/lib/data";

export const dynamic = "force-dynamic";

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

