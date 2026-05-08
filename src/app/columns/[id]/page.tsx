import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getColumnById } from "@/lib/data";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const column = await getColumnById(params.id);
  if (!column) return {};
  return {
    title: `${column.title} | バチ抜けルアー図鑑`,
    description: column.body.slice(0, 100)
  };
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

