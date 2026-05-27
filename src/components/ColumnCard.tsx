import Link from "next/link";
import { excerptComment } from "@/lib/comment-excerpt";
import type { ColumnPost } from "@/types/db";

function plainTextFromMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type ColumnCardProps = {
  column: ColumnPost;
  showExcerpt?: boolean;
  titleTag?: "h2" | "h3";
};

export function ColumnCard({ column, showExcerpt = false, titleTag: Title = "h3" }: ColumnCardProps) {
  const excerpt = showExcerpt ? excerptComment(plainTextFromMarkdown(column.body)) : null;

  return (
    <Link href={`/columns/${column.id}`} className="lure-card relative block p-4 hover:translate-y-[-2px]">
      <span className="lure-card-accent" />
      <p className="mb-2 inline-block rounded px-2 py-1 text-[10px] badge-bachi">{column.category}</p>
      <Title className="serif-title text-sm">{column.title}</Title>
      <p className="mt-2 text-[11px] text-[var(--muted)]">{column.published_at?.slice(0, 10)}</p>
      {excerpt ? (
        <>
          <p className="mt-3 text-[12px] leading-[1.75] text-[var(--paper)]">{excerpt}</p>
          <p className="mt-2 text-[11px] text-[var(--teal)]">続きを読む →</p>
        </>
      ) : (
        <p className="mt-3 text-[11px] text-[var(--teal)]">記事を読む →</p>
      )}
    </Link>
  );
}
