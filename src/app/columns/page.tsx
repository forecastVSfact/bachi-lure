import Link from "next/link";
import { ColumnListItem } from "@/components/ColumnListItem";
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

export default async function ColumnsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const category = sp.category ?? "all";
  const allColumns = await getColumns();
  const columns = category === "all" ? allColumns : allColumns.filter((col) => col.category === category);
  // 記事が1本もないカテゴリは、押すと空白になるのでボタンを出さない
  const categories = COLUMN_CATEGORY_LABELS.filter((c) => allColumns.some((col) => col.category === c));

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
      <h1 className="serif-title mb-6 text-2xl font-bold md:text-3xl">管理人コラム一覧</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/columns" className={`filter-tab column-filter ${category === "all" ? "active" : ""}`}>すべて</Link>
        {categories.map((c) => (
          <Link key={c} href={`/columns?category=${encodeURIComponent(c)}`} className={`filter-tab column-filter ${category === c ? "active" : ""}`}>{c}</Link>
        ))}
      </div>
      <div className="max-w-3xl">
        {columns.map((col) => (
          <ColumnListItem key={col.id} column={col} />
        ))}
      </div>
    </div>
  );
}

