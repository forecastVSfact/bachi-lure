import Link from "next/link";
import { LureSummary } from "@/components/LureSummary";
import { excerptComment } from "@/lib/comment-excerpt";
import type { Lure } from "@/types/db";

type LureCardProps = {
  lure: Lure;
  showCommentExcerpt?: boolean;
};

export function LureCard({ lure, showCommentExcerpt = false }: LureCardProps) {
  const excerpt = showCommentExcerpt ? excerptComment(lure.comment) : null;
  const href = excerpt ? `/lures/${lure.id}#admin-comment` : `/lures/${lure.id}`;

  return (
    <Link href={href} className="lure-card relative block overflow-hidden p-4">
      <span className="lure-card-accent" />
      <LureSummary lure={lure} />
      {excerpt ? (
        <div className="mt-3 border-l-[3px] border-[var(--teal)] bg-[rgba(29,158,117,0.05)] px-3 py-2.5">
          <p className="text-[12px] leading-[1.75] text-[var(--paper)]">{excerpt}</p>
          <p className="mt-2 text-[11px] text-[var(--teal)]">続きを読む →</p>
        </div>
      ) : null}
    </Link>
  );
}
