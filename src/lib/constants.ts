export const BACHI_TYPE_LABEL: Record<string, string> = {
  river: "川バチ",
  harbor_drift: "港湾バチ（漂うタイプ）",
  harbor_wave: "港湾バチ（引き波タイプ）",
  kurukuru: "クルクルバチ",
  bottom: "底バチ"
};

export const BACHI_TYPES = ["river", "harbor_drift", "harbor_wave", "kurukuru", "bottom"] as const;

export const SPEED_RANGE_LABEL: Record<string, string> = {
  dead_slow: "デッドスロー",
  slow: "スロー",
  medium: "ミディアム",
  all: "速度問わず"
};

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

