import {
  BACHI_TYPE_LABEL,
  BACHI_TYPES,
  CASTING_DISTANCE_LABEL,
  LURE_TYPE_LABEL,
  formatDepthRange,
  formatSpeedRangeParts
} from "@/lib/constants";
import { getLureImagePublicUrl } from "@/lib/lure-image";
import type { Lure, LureImage } from "@/types/db";

type LureSummaryProps = {
  lure: Lure;
  /** 詳細ページ用。複数画像があるときサムネイルを表示 */
  images?: LureImage[];
};

export function LureSummary({ lure, images }: LureSummaryProps) {
  const bachiTypeSet = new Set(lure.bachi_types);
  const orderedBachiTypes = BACHI_TYPES.filter((type) => bachiTypeSet.has(type));
  const rating = lure.rating ?? 0;
  const speedLabels = formatSpeedRangeParts(lure.speed_range);
  const imageUrl = lure.image_url;

  const galleryImages =
    images && images.length > 1
      ? [...images].sort((a, b) => a.sort_order - b.sort_order)
      : null;

  return (
    <>
      <div className="relative mb-4 h-40 overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--water-mid)]">
        <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap gap-1 text-[10px]">
          {orderedBachiTypes.length ? (
            orderedBachiTypes.map((type) => (
              <span key={type} className="badge-bachi rounded px-2 py-1">
                {BACHI_TYPE_LABEL[type] ?? type}
              </span>
            ))
          ) : (
            <span className="badge-bachi rounded px-2 py-1">未設定</span>
          )}
          <span className="badge-type rounded px-2 py-1">{LURE_TYPE_LABEL[lure.lure_type] ?? lure.lure_type}</span>
        </div>
        {imageUrl ? (
          <div className="flex h-full items-center justify-center p-3">
            <img src={imageUrl} alt={lure.name} className="max-h-full max-w-full object-contain" />
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

      {galleryImages ? (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {galleryImages.map((img) => {
            const thumb = getLureImagePublicUrl(img);
            if (!thumb) return null;
            return (
              <div
                key={img.id}
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--border)] bg-[var(--water-mid)] p-1"
              >
                <img src={thumb} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            );
          })}
        </div>
      ) : null}

      <h1 className="serif-title text-base font-bold">{lure.name}</h1>
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
          <p className="text-xs leading-snug text-[var(--paper)]">
            {speedLabels.map((label, index) => (
              <span key={`${label}-${index}`}>
                {index > 0 ? "、" : null}
                {label}
              </span>
            ))}
          </p>
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
    </>
  );
}
