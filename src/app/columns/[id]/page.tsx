import Link from "next/link";
import { notFound } from "next/navigation";
import { ColumnMarkdown } from "@/components/ColumnMarkdown";
import { ColumnRelated } from "@/components/ColumnRelated";
import { JsonLd } from "@/components/JsonLd";
import {
  columnKeywords,
  columnMetaDescription,
  resolveColumnOgImage
} from "@/lib/column-seo";
import { buildBreadcrumbJsonLd, buildColumnArticleJsonLd } from "@/lib/json-ld";
import { getColumnById, getColumns } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const column = await getColumnById(params.id);
  if (!column) return {};

  return createMetadata({
    title: column.title,
    description: columnMetaDescription(column),
    path: `/columns/${column.id}`,
    imageUrl: resolveColumnOgImage(column),
    keywords: columnKeywords(column),
    openGraphType: "article",
    publishedTime: column.published_at ?? undefined,
    modifiedTime: column.updated_at ?? column.published_at ?? undefined
  });
}

export default async function ColumnDetailPage({ params }: { params: { id: string } }) {
  const [column, columns] = await Promise.all([getColumnById(params.id), getColumns()]);
  if (!column) notFound();

  const publishedDate = column.published_at?.slice(0, 10);

  return (
    <article className="lure-card rounded p-4 md:p-8">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "トップ", path: "/" },
            { name: "管理人コラム", path: "/columns" },
            { name: column.title, path: `/columns/${column.id}` }
          ]),
          buildColumnArticleJsonLd(column)
        ]}
      />
      <p className="text-xs text-[var(--muted)]">
        <Link href={`/columns?category=${encodeURIComponent(column.category)}`} className="hover:text-[var(--teal)]">
          {column.category}
        </Link>
        {publishedDate ? (
          <>
            {" / "}
            <time dateTime={column.published_at ?? undefined}>{publishedDate}</time>
          </>
        ) : null}
      </p>
      <h1 className="serif-title mt-2 text-[22px] leading-snug md:mt-3 md:text-[28px] md:leading-tight">{column.title}</h1>
      <div className="markdown-content mt-4 md:mt-6">
        <ColumnMarkdown>{column.body}</ColumnMarkdown>
      </div>
      <ColumnRelated currentId={column.id} columns={columns} />
    </article>
  );
}
