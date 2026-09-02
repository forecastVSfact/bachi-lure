import Link from "next/link";
import { LureCard } from "@/components/LureCard";
import { JsonLd } from "@/components/JsonLd";
import type { BachiPageConfig } from "@/lib/bachi-pages";
import { buildBreadcrumbJsonLd, buildLureCollectionJsonLd } from "@/lib/json-ld";
import type { Lure } from "@/types/db";

type BachiTypeLuresPageProps = {
  config: BachiPageConfig;
  lures: Lure[];
};

export function BachiTypeLuresPage({ config, lures }: BachiTypeLuresPageProps) {
  const path = `/lures/${config.slug}`;

  return (
    <div>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "トップ", path: "/" },
            { name: "ルアー一覧", path: "/lures" },
            { name: config.label, path }
          ]),
          buildLureCollectionJsonLd(lures)
        ]}
      />
      <div className="mb-4 text-[11px] text-[var(--muted)]">
        <Link href="/">トップ</Link> › <Link href="/lures">ルアー一覧</Link> ›{" "}
        <span className="text-[var(--paper)]">{config.label}</span>
      </div>
      <h1 className="serif-title mb-4 text-3xl font-bold">{config.label}向けルアー一覧</h1>
      <p className="mb-6 text-[13px] leading-[1.9] text-[var(--paper)]">{config.intro}</p>
      <p className="mb-6 text-xs text-[var(--muted)]">
        {lures.length}件のルアーが{config.label}に対応しています。
        <Link href="/lures" className="ml-2 text-[var(--teal)] hover:underline">
          すべてのルアーを見る
        </Link>
      </p>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {lures.map((lure) => (
          <LureCard key={lure.id} lure={lure} />
        ))}
      </div>
    </div>
  );
}
