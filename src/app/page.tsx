import Link from "next/link";
import { ColumnCard } from "@/components/ColumnCard";
import { HomeIntro } from "@/components/HomeIntro";
import { JsonLd } from "@/components/JsonLd";
import { getLatestColumns, getRecommendedLures, getTopStats } from "@/lib/data";
import {
  buildHomeFaqJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd
} from "@/lib/json-ld";
import { excerptComment } from "@/lib/comment-excerpt";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "バチ抜けルアー地獄 | シーバスバチ抜け特化データベース",
  description:
    "川バチ・港湾バチ・クルクルバチ・底バチ。シーバスのバチ抜けに効くルアーを管理人の実釣インプレ付きで掲載。バチ抜けルアー選び・おすすめ比較に。",
  path: "/",
  absoluteTitle: true
});

export default async function HomePage() {
  const [stats, ranking, columns] = await Promise.all([
    getTopStats(),
    getRecommendedLures(5),
    getLatestColumns(3)
  ]);

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <JsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd(), buildHomeFaqJsonLd()]} />
      <section className="hero-element order-1 rounded bg-gradient-to-b from-[#020810] via-[#061220] to-[#0d2035] px-5 pb-6 pt-0 md:px-10 md:pb-10 md:pt-4">
        <p
          className="mb-4 text-[13px] uppercase text-[var(--water-light)]"
          style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.3em" }}
        >
          SEABASS BACHI LURE DATABASE
        </p>
        <h1 className="serif-title text-5xl font-bold leading-tight [font-size:clamp(2rem,8vw,4.5rem)]">
          <em className="text-[var(--amber)] not-italic">バチ抜けルアー地獄</em>
        </h1>
        <p className="mt-5 text-[13px] text-[var(--muted)]">
          川バチ・港湾バチ・クルクルバチ・底バチ。管理人の実釣インプレ付き。
        </p>
        <div className="mt-5 max-w-md rounded border border-[var(--border)] bg-black/10 p-4 md:mt-8">
          <p className="text-[11px] text-[var(--muted)]">掲載ルアー数</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1 leading-tight">
            <span className="text-[28px] text-[var(--moon)]" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
              {stats.lureCount}件
            </span>
            <span className="text-[13px] text-[var(--paper)]">（実釣インプレ{stats.fishedCount}件）</span>
          </p>
        </div>
      </section>

      <HomeIntro className="order-5 md:order-2" />

      <section className="order-2 md:order-3">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">おすすめルアー</h2>
          <Link href="/lures" className="shrink-0 text-sm text-[var(--teal)] underline-offset-2 hover:underline">
            ルアー一覧へ →
          </Link>
        </div>
        <div className="space-y-3">
          {ranking.map((lure) => {
            const excerpt = excerptComment(lure.comment, { maxLength: 90 });
            return (
              <Link
                key={lure.id}
                href={excerpt ? `/lures/${lure.id}#admin-comment` : `/lures/${lure.id}`}
                className="lure-card block rounded px-4 py-4 hover:translate-y-[-2px]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--border)] bg-[var(--water-mid)] p-1">
                    {lure.image_url ? (
                      <img
                        src={lure.image_url}
                        alt={lure.name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M3 12C7 5 17 5 21 12C17 19 7 19 3 12Z" stroke="#4a9aba" strokeWidth="1.5" />
                        <circle cx="14" cy="11" r="1.2" fill="#4a9aba" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="serif-title text-base">{lure.name}</p>
                    <p className="text-xs text-[var(--muted)]">{lure.maker}</p>
                  </div>
                  <p className="text-sm text-[var(--amber)]">{"★".repeat(lure.rating ?? 0)}</p>
                </div>
                {excerpt ? (
                  <p className="mt-3 line-clamp-3 border-l-[3px] border-[var(--teal)] bg-[rgba(29,158,117,0.05)] px-3 py-2 text-[12px] leading-[1.75] text-[var(--paper)]">
                    {excerpt}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="order-3 md:order-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">管理人コラム</h2>
          <Link href="/columns" className="shrink-0 text-sm text-[var(--teal)] underline-offset-2 hover:underline">
            コラム一覧へ →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((col) => (
            <ColumnCard key={col.id} column={col} showExcerpt titleTag="h3" />
          ))}
        </div>
      </section>

      <section className="order-6 rounded bg-[var(--water-mid)] p-10 text-center">
        <h2 className="serif-title text-lg">オヤビッチャ</h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">バチ抜け歴: 28年 / フィールド: 東京湾奥</p>
        <div className="mx-auto mt-4 max-w-xl border-l-[3px] border-[var(--teal)] bg-black/10 p-3 text-left text-[13px] text-[var(--paper)]">
          実釣ベースで、夜の水面に効くバチ抜けルアーだけを厳選しています。
        </div>
      </section>
    </div>
  );
}

