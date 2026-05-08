import Link from "next/link";
import { notFound } from "next/navigation";
import { LureCard } from "@/components/LureCard";
import { LureGallery } from "@/components/LureGallery";
import { BACHI_TYPE_LABEL, LURE_TYPE_LABEL } from "@/lib/constants";
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
  const [images, related] = await Promise.all([getLureImages(lure.id), getRelatedLures(lure.id, lure.bachi_types)]);

  const min = lure.range_min_cm ?? 0;
  const max = lure.range_max_cm ?? 0;

  return (
    <div className="space-y-8">
      <div className="text-[11px] text-[var(--muted)]">
        <Link href="/">トップ</Link> › <Link href="/lures">ルアー一覧</Link> › <span className="text-[var(--paper)]">{lure.name}</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LureGallery images={images} />
        </div>
        <div className="lure-card space-y-4 rounded p-6 lg:col-span-2">
          <p className="flex flex-wrap gap-2 text-xs">
            {lure.bachi_types.length ? (
              lure.bachi_types.map((type) => (
                <span key={type} className="badge-bachi rounded px-2 py-1">{BACHI_TYPE_LABEL[type] ?? type}</span>
              ))
            ) : (
              <span className="badge-bachi rounded px-2 py-1">未設定</span>
            )}
            <span className="badge-type rounded px-2 py-1">{LURE_TYPE_LABEL[lure.lure_type]}</span>
          </p>
          <h1 className="serif-title text-[28px] font-bold">{lure.name}</h1>
          <p className="text-sm text-[var(--muted)]">{lure.maker}</p>
          <p className="text-xl text-[var(--amber)]">{"★".repeat(lure.rating ?? 0)}</p>
          <p className="text-2xl text-[var(--moon)]">{lure.price_yen ? `¥${lure.price_yen.toLocaleString()}` : "価格未設定"}</p>
          <div className="space-y-2">
            {lure.amazon_url && (
              <a href={lure.amazon_url} className="block w-full rounded-sm bg-[var(--amazon-orange)] px-4 py-3 text-center font-semibold text-black">
                Amazon
              </a>
            )}
            {lure.rakuten_url && (
              <a href={lure.rakuten_url} className="block w-full rounded-sm bg-[var(--rakuten-red)] px-4 py-3 text-center font-semibold text-white">
                楽天
              </a>
            )}
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 border-b border-[var(--border)] pb-2 text-xs tracking-[0.1em] text-[var(--muted)]">SPEC</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">サイズ</p><p className="text-[15px] text-[var(--moon)]">{lure.size_mm ?? "-"}mm</p></div>
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">ウェイト</p><p className="text-[15px] text-[var(--moon)]">{lure.weight_g ?? "-"}g</p></div>
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">フック</p><p className="text-[15px] text-[var(--moon)]">{lure.hook_size ?? "-"}</p></div>
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">泳ぎ姿勢</p><p className="text-[15px] text-[var(--moon)]">{lure.swim_posture}</p></div>
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">速度域</p><p className="text-[15px] text-[var(--moon)]">{lure.speed_range}</p></div>
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">飛距離</p><p className="text-[15px] text-[var(--moon)]">{lure.casting_distance}</p></div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="border-b border-[var(--border)] pb-2 text-xs tracking-[0.1em] text-[var(--muted)]">RANGE</h2>
        <div className="h-1.5 rounded-full bg-white/5">
          <div className="h-1.5 rounded-full bg-[var(--teal)]" style={{ marginLeft: `${min}%`, width: `${Math.max(max - min, 2)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--muted)]"><span>0cm</span><span>100cm</span></div>
      </section>

      {lure.lure_type === "sinking" && (
        <section className="grid gap-3 md:grid-cols-3">
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">シンキング種別</p><p className="text-[15px] text-[var(--moon)]">{lure.sinking_type ?? "-"}</p></div>
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">フォール姿勢</p><p className="text-[15px] text-[var(--moon)]">{lure.fall_posture ?? "-"}</p></div>
          <div className="lure-card p-3"><p className="text-[10px] text-[var(--muted)]">フォール種別</p><p className="text-[15px] text-[var(--moon)]">{lure.fall_type ?? "-"}</p></div>
        </section>
      )}

      <section className="border-l-[3px] border-[var(--teal)] bg-[rgba(29,158,117,0.05)] px-5 py-4 text-[13px] leading-[1.8] text-[var(--paper)]">
        <h2 className="mb-2 text-xs tracking-[0.1em] text-[var(--muted)]">管理人コメント</h2>
        <p>{lure.comment && lure.comment.trim() ? lure.comment : "使ったことがないため記載なし"}</p>
      </section>

      {lure.youtube_url && (
        <section className="space-y-2">
          <h2 className="text-xs tracking-[0.1em] text-[var(--muted)]">YouTube</h2>
          <div className="overflow-hidden rounded">
            <iframe className="aspect-video w-full" src={lure.youtube_url.replace("watch?v=", "embed/")} title="YouTube" allowFullScreen />
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title mb-3">関連ルアー</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">{related.map((r) => <LureCard key={r.id} lure={r} />)}</div>
      </section>

      <p className="text-[11px] text-[var(--muted)]">※このページにはアフィリエイトリンクを含みます</p>
    </div>
  );
}

