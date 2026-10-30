import Link from "next/link";
import { LureCard } from "@/components/LureCard";
import { BACHI_PAGE_CONFIGS } from "@/lib/bachi-pages";
import { getTopRatedLures } from "@/lib/data";

/** コラム末尾に置く、個別ルアーページ・バチ種別ページへの内部リンク集 */
export async function ColumnLures() {
  const lures = await getTopRatedLures(6);
  if (!lures.length) return null;

  return (
    <section className="mt-10 border-t border-[var(--border)] pt-8" aria-labelledby="column-lures-heading">
      <h2 id="column-lures-heading" className="serif-title mb-2 text-xl font-bold">
        管理人が実釣したバチ抜けルアー
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">評価の高いルアーから紹介します。詳しいインプレは各ページで見られます。</p>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {lures.map((lure) => (
          <LureCard key={lure.id} lure={lure} />
        ))}
      </div>
      <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {BACHI_PAGE_CONFIGS.map((config) => (
          <Link
            key={config.slug}
            href={`/lures/${config.slug}`}
            className="text-[var(--teal)] underline-offset-2 hover:underline"
          >
            {config.label}向けルアー
          </Link>
        ))}
        <Link href="/lures" className="text-[var(--teal)] underline-offset-2 hover:underline">
          ルアー一覧をすべて見る
        </Link>
      </p>
    </section>
  );
}
