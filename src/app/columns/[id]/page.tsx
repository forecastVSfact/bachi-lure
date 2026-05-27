import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getColumnById } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const column = await getColumnById(params.id);
  if (!column) return {};
  const description = column.body.replace(/\s+/g, " ").trim().slice(0, 120);

  return createMetadata({
    title: column.title,
    description: description || `${column.category}に関する管理人コラム。`,
    path: `/columns/${column.id}`
  });
}

export default async function ColumnDetailPage({ params }: { params: { id: string } }) {
  const column = await getColumnById(params.id);
  if (!column) notFound();

  return (
    <article className="lure-card rounded p-6 md:p-8">
      <p className="text-xs text-[var(--muted)]">{column.category} / {column.published_at?.slice(0, 10)}</p>
      <h1 className="serif-title mt-3 text-[32px] leading-tight">{column.title}</h1>
      <div className="markdown-content mt-6">
        <ReactMarkdown>{column.body}</ReactMarkdown>
      </div>
    </article>
  );
}

