import Link from "next/link";
import { ColumnCard } from "@/components/ColumnCard";
import type { ColumnPost } from "@/types/db";

type ColumnRelatedProps = {
  currentId: string;
  columns: ColumnPost[];
};

export function ColumnRelated({ currentId, columns }: ColumnRelatedProps) {
  const related = columns.filter((column) => column.id !== currentId).slice(0, 3);
  if (!related.length) return null;

  return (
    <section className="mt-10 border-t border-[var(--border)] pt-8" aria-labelledby="related-columns-heading">
      <h2 id="related-columns-heading" className="serif-title mb-4 text-xl font-bold">
        ほかのコラム
      </h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {related.map((column) => (
          <ColumnCard key={column.id} column={column} titleTag="h3" />
        ))}
      </div>
      <p className="mt-4 text-sm">
        <Link href="/lures" className="text-[var(--teal)] underline-offset-2 hover:underline">
          バチ抜けルアー一覧
        </Link>
        {" ／ "}
        <Link href="/columns" className="text-[var(--teal)] underline-offset-2 hover:underline">
          コラム一覧
        </Link>
      </p>
    </section>
  );
}
