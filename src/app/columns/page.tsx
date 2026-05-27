import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { COLUMN_CATEGORY_LABELS } from "@/lib/constants";
import { getColumns } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildColumnCollectionJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "管理人コラム一覧",
  description:
    "バチ抜け・シーバス釣りの管理人コラム。テクニック、タックル、エリアガイドなど実釣ベースの記事一覧。",
  path: "/columns"
});

export default async function ColumnsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const category = searchParams.category ?? "all";
  const columns = await getColumns(category);

  return (
    <div>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "トップ", path: "/" },
            { name: "管理人コラム", path: "/columns" }
          ]),
          buildColumnCollectionJsonLd()
        ]}
      />
      <h1 className="serif-title mb-6 text-3xl font-bold">管理人コラム一覧</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/columns" className={`filter-tab ${category === "all" ? "active" : ""}`}>すべて</Link>
        {COLUMN_CATEGORY_LABELS.map((c) => (
          <Link key={c} href={`/columns?category=${encodeURIComponent(c)}`} className={`filter-tab ${category === c ? "active" : ""}`}>{c}</Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((col) => (
          <Link key={col.id} href={`/columns/${col.id}`} className="lure-card block p-4">
            <p className="mb-2 inline-block rounded px-2 py-1 text-[10px] badge-bachi">{col.category}</p>
            <h2 className="serif-title text-base">{col.title}</h2>
            <p className="mt-2 text-[11px] text-[var(--muted)]">{col.published_at?.slice(0, 10)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

