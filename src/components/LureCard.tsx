import Link from "next/link";
import {
  BACHI_TYPE_LABEL,
  CASTING_DISTANCE_LABEL,
  LURE_TYPE_LABEL,
  formatDepthRange,
  formatSpeedRangeDisplay
} from "@/lib/constants";
import type { Lure } from "@/types/db";

export function LureCard({ lure }: { lure: Lure }) {
  const primaryBachiType = lure.bachi_types[0];
  const rating = lure.rating ?? 0;

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
          <div className="flex h-full items-center justify-center p-3">
            <img
              src={lure.image_url}
              alt={lure.name}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>
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
          <p className="text-[10px] text-[var(--muted)]">レンジ（水深）</p>
          <p className="text-xs text-[var(--paper)]">{formatDepthRange(lure.range_min_cm, lure.range_max_cm)}</p>
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
          <p className="text-xs leading-snug text-[var(--paper)]">{formatSpeedRangeDisplay(lure.speed_range)}</p>
        </div>
      </div>

      <div className="my-3 h-px bg-[var(--border)]" />

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <p className="text-[10px] text-[var(--muted)]">管理人評価</p>
          <p className="tracking-wider text-[var(--amber)]">{`${"★".repeat(rating)}${"☆".repeat(5 - rating)}`}</p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--muted)]">飛距離</p>
          <p className="text-[var(--paper)]">
            {CASTING_DISTANCE_LABEL[lure.casting_distance] ?? lure.casting_distance}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] text-[var(--muted)]">価格</p>
          <p className="text-[var(--moon)]">{lure.price_yen ? `¥${lure.price_yen.toLocaleString()}` : "価格未設定"}</p>
        </div>
      </div>
    </Link>
  );
}
