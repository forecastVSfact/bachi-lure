import type { LureImage } from "@/types/db";

const STORAGE_BUCKET = "lure-images";

/** 表示は Supabase Storage のみ（luredatabase/images から import:images で登録） */
export function getLureImagePublicUrl(image: Pick<LureImage, "id" | "storage_path">): string | null {
  if (!image.storage_path?.trim()) return null;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  const path = image.storage_path.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path}?v=${image.id}`;
}

export function pickPrimaryImageUrl(images: LureImage[]): string | null {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  for (const image of sorted) {
    const url = getLureImagePublicUrl(image);
    if (url) return url;
  }
  return null;
}
