import Link from "next/link";
import { LureSummary } from "@/components/LureSummary";
import type { Lure } from "@/types/db";

export function LureCard({ lure }: { lure: Lure }) {
  return (
    <Link href={`/lures/${lure.id}`} className="lure-card relative block overflow-hidden p-4">
      <span className="lure-card-accent" />
      <LureSummary lure={lure} />
    </Link>
  );
}
