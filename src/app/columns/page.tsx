import Link from "next/link";
import { ColumnCard } from "@/components/ColumnCard";
import { JsonLd } from "@/components/JsonLd";
import { COLUMN_CATEGORY_LABELS } from "@/lib/constants";
import { getColumns } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildColumnCollectionJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "管理人コラム一覧｜バチ抜け・シーバス釣り",
  description:
    "バチ抜け・シーバス釣りの管理人コラム。テクニック、タックル、エリアガイド、バチ抜けの歴史など実釣ベースの記事一覧。",
  path: "/columns",
  keywords: ["バチ抜け", "シーバス", "釣りコラム", "管理人コラム", "バチ抜けルアー"]
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
          buildColumnCollectionJsonLd(columns)
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
          <ColumnCard key={col.id} column={col} showExcerpt titleTag="h2" />
        ))}
      </div>
    </div>
  );
}

