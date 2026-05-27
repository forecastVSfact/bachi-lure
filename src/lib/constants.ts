export const BACHI_TYPE_LABEL: Record<string, string> = {
  river: "川バチ",
  harbor: "港湾バチ",
  kurukuru: "クルクルバチ",
  bottom: "底バチ"
};

export const BACHI_TYPES = ["river", "harbor", "kurukuru", "bottom"] as const;

export const SPEED_RANGE_LABEL: Record<string, string> = {
  dead_slow: "デッドスロー",
  slow: "スロー",
  medium: "ミディアム",
  fast: "ファスト",
  all: "速度問わず"
};

const SPEED_RANGE_ORDER = ["dead_slow", "slow", "medium", "fast", "all"] as const;

export function formatDepthRange(minCm: number | null, maxCm: number | null): string {
  if (minCm == null && maxCm == null) return "-";
  if (minCm != null && maxCm != null) return `${minCm}〜${maxCm}cm`;
  if (maxCm != null) return `〜${maxCm}cm`;
  if (minCm != null) return `${minCm}cm〜`;
  return "-";
}

function normalizeSpeedToken(part: string): string {
  let key = part.trim().toLowerCase().replace(/-/g, "_");
  if (key === "deadslow") key = "dead_slow";
  return key;
}

/** speed_range は単一キーまたは dead_slow,slow のようなカンマ区切り */
export function formatSpeedRangeParts(speedRange: string | null | undefined): string[] {
  if (!speedRange?.trim()) return ["-"];
  const raw = speedRange.trim().toLowerCase();
  if (raw === "all") return [SPEED_RANGE_LABEL.all];

  const tokens = raw
    .split(/[,、]/)
    .map(normalizeSpeedToken)
    .filter(Boolean);

  const unique = new Set(tokens);
  const ordered = SPEED_RANGE_ORDER.filter((key) => unique.has(key));
  const keys = ordered.length ? ordered : tokens;
  const labels = keys.map((key) => SPEED_RANGE_LABEL[key] ?? key);

  return labels.length ? labels : [SPEED_RANGE_LABEL[raw] ?? speedRange];
}

export function formatSpeedRangeDisplay(speedRange: string | null | undefined): string {
  return formatSpeedRangeParts(speedRange).join("、");
}

export const LURE_TYPE_LABEL: Record<string, string> = {
  floating: "フローティング",
  sinking: "シンキング"
};

export const CASTING_DISTANCE_LABEL: Record<string, string> = {
  short: "近距離",
  medium: "中距離",
  long: "遠投可"
};

export const COLUMN_CATEGORY_LABELS = [
  "バチ抜けの裏技・テクニック",
  "タックル",
  "バチ抜けの歴史・文化",
  "東京湾バチ抜けエリアガイド"
];

