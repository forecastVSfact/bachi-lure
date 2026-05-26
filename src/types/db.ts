export type LureType = "floating" | "sinking";
export type BachiType = "river" | "harbor" | "kurukuru" | "bottom";

export type LureBase = {
  id: string;
  name: string;
  maker: string;
  size_mm: number | null;
  weight_g: number | null;
  price_yen: number | null;
  hook_size: string | null;
  lure_type: LureType;
  action: string | null;
  range_min_cm: number | null;
  range_max_cm: number | null;
  swim_posture: string;
  speed_range: string;
  casting_distance: string;
  youtube_url: string | null;
  amazon_url: string | null;
  rakuten_url: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type Lure = LureBase & {
  bachi_types: BachiType[];
  image_url?: string | null;
};

export type LureImage = {
  id: string;
  lure_id: string;
  storage_path: string | null;
  external_url: string | null;
  sort_order: number;
  created_at: string;
};

export type ColumnPost = {
  id: string;
  title: string;
  category: string;
  body: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

