import Link from "next/link";
import { notFound } from "next/navigation";
import { LureCard } from "@/components/LureCard";
import { LureSummary } from "@/components/LureSummary";
import { BACHI_TYPE_LABEL } from "@/lib/constants";
import { getLureById, getLureImages, getRelatedLures } from "@/lib/data";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const lure = await getLureById(params.id);
  if (!lure) return {};
  const bachiTypeLabel = lure.bachi_types.length
    ? lure.bachi_types.map((type) => BACHI_TYPE_LABEL[type] ?? type).join("・")
    : "未設定";
  return {
    title: `${lure.name}（${lure.maker}）| バチ抜けルアー図鑑`,
    description: `${lure.name}のバチ抜けインプレ。レンジ${lure.range_min_cm ?? "-"}?${lure.range_max_cm ?? "-"}cm、${bachiTypeLabel}対応。管理人おすすめ度★${lure.rating ?? "-"}。`
  };
}

export default async function LureDetailPage({ params }: { params: { id: string } }) {
  const lure = await getLureById(params.id);
  if (!lure) notFound();
  const [images, related] = await Promise.all([
    getLureImages(lure.id),
    getRelatedLures(lure.id, lure.bachi_types, lure.size_mm)
  ]);

  return (
    <div className="space-y-8">
      <div className="text-[11px] text-[var(--muted)]">
        <Link href="/">トップ</Link> › <Link href="/lures">ルアー一覧</Link> › <span className="text-[var(--paper)]">{lure.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
        <div className="mx-auto w-full max-w-md space-y-4 lg:mx-0 lg:max-w-none">
          <div className="lure-card relative overflow-hidden p-4">
            <span className="lure-card-accent" />
            <LureSummary lure={lure} images={images} size="detail" />
          </div>

          {(lure.amazon_url || lure.rakuten_url) && (
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              {lure.amazon_url && (
                <a
                  href={lure.amazon_url}
                  className="block w-full rounded-sm bg-[var(--amazon-orange)] px-4 py-3 text-center font-semibold text-black"
                >
                  Amazon
                </a>
              )}
              {lure.rakuten_url && (
                <a
                  href={lure.rakuten_url}
                  className="block w-full rounded-sm bg-[var(--rakuten-red)] px-4 py-3 text-center font-semibold text-white"
                >
                  楽天
                </a>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-8">
          <section className="border-l-[3px] border-[var(--teal)] bg-[rgba(29,158,117,0.05)] px-5 py-4 text-[13px] leading-[1.8] text-[var(--paper)]">
            <h2 className="mb-2 text-xs tracking-[0.1em] text-[var(--muted)]">管理人コメント</h2>
            <p>{lure.comment && lure.comment.trim() ? lure.comment : "使ったことがないため記載なし"}</p>
          </section>

          {lure.youtube_url && (
            <section className="space-y-2">
              <h2 className="text-xs tracking-[0.1em] text-[var(--muted)]">YouTube</h2>
              <div className="overflow-hidden rounded">
                <iframe
                  className="aspect-video w-full"
                  src={lure.youtube_url.replace("watch?v=", "embed/")}
                  title="YouTube"
                  allowFullScreen
                />
              </div>
            </section>
          )}
        </div>
      </div>

      <section>
        <h2 className="section-title mb-3">関連ルアー</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <LureCard key={r.id} lure={r} />
          ))}
        </div>
      </section>

      <p className="text-[11px] text-[var(--muted)]">※このページにはアフィリエイトリンクを含みます</p>
    </div>
  );
}
