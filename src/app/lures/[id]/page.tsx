import Link from "next/link";
import { notFound } from "next/navigation";
import { LureCard } from "@/components/LureCard";
import { LureGallery } from "@/components/LureGallery";
import { LureSummary } from "@/components/LureSummary";
import {
  BACHI_TYPE_LABEL,
  CASTING_DISTANCE_LABEL,
  formatDepthRange,
  formatSpeedRangeDisplay,
  LURE_TYPE_LABEL
} from "@/lib/constants";
import type { Lure } from "@/types/db";
import { getLureById, getLureImages, getRelatedLures } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const lure = await getLureById(params.id);
  if (!lure) return {};
  const bachiTypeLabel = lure.bachi_types.length
    ? lure.bachi_types.map((type) => BACHI_TYPE_LABEL[type] ?? type).join("・")
    : "未設定";
  const depth = formatDepthRange(lure.range_min_cm, lure.range_max_cm);

  return createMetadata({
    title: `${lure.name}（${lure.maker}）`,
    description: `${lure.name}のバチ抜けインプレ。レンジ${depth}、${bachiTypeLabel}対応。管理人おすすめ度★${lure.rating ?? "-"}。`,
    path: `/lures/${lure.id}`,
    imageUrl: lure.image_url
  });
}

function AffiliateButtons({ lure }: { lure: Lure }) {
  if (!lure.amazon_url && !lure.rakuten_url) return null;

  return (
    <div className="flex flex-col gap-2">
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
  );
}

function AdminComment({ lure }: { lure: Lure }) {
  return (
    <section className="border-l-[3px] border-[var(--teal)] bg-[rgba(29,158,117,0.05)] px-5 py-4 text-[13px] leading-[1.8] text-[var(--paper)]">
      <h2 className="mb-2 text-xs tracking-[0.1em] text-[var(--muted)]">管理人コメント</h2>
      <p>{lure.comment && lure.comment.trim() ? lure.comment : "使ったことがないため記載なし"}</p>
    </section>
  );
}

function YoutubeSection({ lure }: { lure: Lure }) {
  if (!lure.youtube_url) return null;

  return (
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
  );
}

export default async function LureDetailPage({ params }: { params: { id: string } }) {
  const lure = await getLureById(params.id);
  if (!lure) notFound();
  const [images, related] = await Promise.all([
    getLureImages(lure.id),
    getRelatedLures(lure.id, lure.bachi_types, lure.size_mm)
  ]);

  const rating = lure.rating ?? 0;

  return (
    <div className="space-y-8">
      <div className="text-[11px] text-[var(--muted)]">
        <Link href="/">トップ</Link> › <Link href="/lures">ルアー一覧</Link> › <span className="text-[var(--paper)]">{lure.name}</span>
      </div>

      {/* スマホ: 一覧カードと同じコンパクト表示 */}
      <div className="space-y-8 lg:hidden">
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="lure-card relative overflow-hidden p-4">
            <span className="lure-card-accent" />
            <LureSummary lure={lure} images={images} />
          </div>
          <AffiliateButtons lure={lure} />
        </div>
        <AdminComment lure={lure} />
        <YoutubeSection lure={lure} />
      </div>

      {/* PC: ギャラリー + SPEC レイアウト */}
      <div className="hidden space-y-8 lg:block">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <LureGallery images={images} lureName={lure.name} />
          </div>
          <div className="lure-card space-y-4 rounded p-6 lg:col-span-2">
            <p className="flex flex-wrap gap-2 text-xs">
              {lure.bachi_types.length ? (
                lure.bachi_types.map((type) => (
                  <span key={type} className="badge-bachi rounded px-2 py-1">
                    {BACHI_TYPE_LABEL[type] ?? type}
                  </span>
                ))
              ) : (
                <span className="badge-bachi rounded px-2 py-1">未設定</span>
              )}
              <span className="badge-type rounded px-2 py-1">{LURE_TYPE_LABEL[lure.lure_type]}</span>
            </p>
            <h1 className="serif-title text-[28px] font-bold">{lure.name}</h1>
            <p className="text-sm text-[var(--muted)]">{lure.maker}</p>
            <p className="tracking-wider text-xl text-[var(--amber)]">{`${"★".repeat(rating)}${"☆".repeat(5 - rating)}`}</p>
            <p className="text-2xl text-[var(--moon)]">{lure.price_yen ? `¥${lure.price_yen.toLocaleString()}` : "価格未設定"}</p>
            <AffiliateButtons lure={lure} />
          </div>
        </div>

        <section>
          <h2 className="mb-3 border-b border-[var(--border)] pb-2 text-xs tracking-[0.1em] text-[var(--muted)]">SPEC</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">サイズ</p>
              <p className="text-[15px] text-[var(--moon)]">{lure.size_mm ?? "-"}mm</p>
            </div>
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">ウェイト</p>
              <p className="text-[15px] text-[var(--moon)]">{lure.weight_g ?? "-"}g</p>
            </div>
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">レンジ（水深）</p>
              <p className="text-[15px] text-[var(--moon)]">{formatDepthRange(lure.range_min_cm, lure.range_max_cm)}</p>
            </div>
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">フック</p>
              <p className="text-[15px] text-[var(--moon)]">{lure.hook_size ?? "-"}</p>
            </div>
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">アクション</p>
              <p className="text-[15px] text-[var(--moon)]">{lure.action ?? "-"}</p>
            </div>
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">泳ぎ姿勢</p>
              <p className="text-[15px] text-[var(--moon)]">{lure.swim_posture}</p>
            </div>
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">速度域</p>
              <p className="text-[15px] text-[var(--moon)]">{formatSpeedRangeDisplay(lure.speed_range)}</p>
            </div>
            <div className="lure-card p-3">
              <p className="text-[10px] text-[var(--muted)]">飛距離</p>
              <p className="text-[15px] text-[var(--moon)]">
                {CASTING_DISTANCE_LABEL[lure.casting_distance] ?? lure.casting_distance}
              </p>
            </div>
          </div>
        </section>

        <AdminComment lure={lure} />
        <YoutubeSection lure={lure} />
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
