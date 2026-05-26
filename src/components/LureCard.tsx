import Link from "next/link";
import { BACHI_TYPE_LABEL, CASTING_DISTANCE_LABEL, LURE_TYPE_LABEL, SPEED_RANGE_LABEL } from "@/lib/constants";
import type { Lure } from "@/types/db";

export function LureCard({ lure }: { lure: Lure }) {
  const min = lure.range_min_cm ?? 0;
  const max = lure.range_max_cm ?? 0;
  const width = Math.max(max - min, 2);
  const primaryBachiType = lure.bachi_types[0];

  return (
    <Link href={`/lures/${lure.id}`} className="lure-card relative block overflow-hidden p-4">
      <span className="lure-card-accent" />
      <div className="relative mb-4 h-40 overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--water-mid)]">
        <div className="absolute left-2 top-2 z-10 flex gap-1 text-[10px]">
          <span className="badge-bachi rounded px-2 py-1">
            {primaryBachiType ? BACHI_TYPE_LABEL[primaryBachiType] ?? primaryBachiType : "未設定"}
          </span>
          <span className="badge-type rounded px-2 py-1">{LURE_TYPE_LABEL[lure.lure_type] ?? lure.lure_type}</span>
        </div>
        {lure.image_url ? (
          <img src={lure.image_url} alt={lure.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 12C7 5 17 5 21 12C17 19 7 19 3 12Z" stroke="#4a9aba" strokeWidth="1.8" />
              <circle cx="14" cy="11" r="1.4" fill="#4a9aba" />
            </svg>
          </div>
        )}
      </div>

      <h3 className="serif-title text-base font-bold">{lure.name}</h3>
      <p className="mb-3 text-xs text-[var(--muted)]">{lure.maker}</p>

      <div className="mb-3">
        <div className="h-1.5 rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-[var(--teal)]"
            style={{ marginLeft: `${min}%`, width: `${width}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <div>
          <p className="text-[10px] text-[var(--muted)]">サイズ</p>
          <p className="text-xs text-[var(--paper)]">{lure.size_mm ?? "-"}mm</p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--muted)]">ウェイト</p>
          <p className="text-xs text-[var(--paper)]">{lure.weight_g ?? "-"}g</p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--muted)]">アクション</p>
          <p className="text-xs text-[var(--paper)]">{lure.action ?? "-"}</p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--muted)]">泳ぎ姿勢</p>
          <p className="text-xs text-[var(--paper)]">{lure.swim_posture}</p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--muted)]">速度域</p>
          <p className="text-xs text-[var(--paper)]">{SPEED_RANGE_LABEL[lure.speed_range] ?? lure.speed_range}</p>
        </div>
      </div>

      <div className="my-3 h-px bg-[var(--border)]" />
      <div className="flex items-center justify-between text-xs">
        <p className="tracking-wider text-[var(--amber)]">{`${"★".repeat(lure.rating ?? 0)}${"☆".repeat(5 - (lure.rating ?? 0))}`}</p>
        <p className="text-[var(--moon)]">{lure.price_yen ? `¥${lure.price_yen.toLocaleString()}` : "価格未設定"}</p>
      </div>
      <p className="mt-1 text-[10px] text-[var(--muted)]">{CASTING_DISTANCE_LABEL[lure.casting_distance] ?? lure.casting_distance}</p>
    </Link>
  );
}

