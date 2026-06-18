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

type ColumnListItemProps = {
  column: ColumnPost;
};

export function ColumnListItem({ column }: ColumnListItemProps) {
  const excerpt = excerptComment(plainTextFromMarkdown(column.body));
  const publishedDate = column.published_at?.slice(0, 10);

  return (
    <article className="border-b border-[var(--border)] py-7 first:pt-0 last:border-b-0">
      <Link href={`/columns/${column.id}`} className="group block">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          {publishedDate ? (
            <time dateTime={column.published_at ?? undefined} className="tabular-nums">
              {publishedDate}
            </time>
          ) : null}
          <span className="inline-block rounded px-2 py-0.5 text-[10px] badge-bachi">{column.category}</span>
        </div>
        <h2
          className="text-xl font-medium leading-snug text-[var(--moon)] transition-colors duration-200 group-hover:text-[var(--water-light)] md:text-2xl md:leading-tight"
          style={{ fontFamily: "var(--font-serif-jp), 'Noto Serif JP', serif" }}
        >
          {column.title}
        </h2>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)] md:text-[15px]">{excerpt}</p>
        <p className="mt-4 text-sm text-[var(--teal)] transition-transform group-hover:translate-x-1">続きを読む →</p>
      </Link>
    </article>
  );
}
