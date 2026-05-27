import { unstable_noStore as noStore } from "next/cache";
import { pickPrimaryImageUrl } from "@/lib/lure-image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ColumnPost, Lure, LureImage } from "@/types/db";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const LURE_SELECT = "*, lure_bachi_types(bachi_type), lure_images(id, external_url, storage_path, sort_order)";

type LureRowWithRelations = Omit<Lure, "bachi_types" | "image_url"> & {
  lure_bachi_types?: Array<{ bachi_type: string }>;
  lure_images?: Array<Pick<LureImage, "id" | "external_url" | "storage_path" | "sort_order">>;
};

function toLure(row: LureRowWithRelations): Lure {
  const bachi_types = (row.lure_bachi_types ?? []).map((item) => item.bachi_type).filter(Boolean) as Lure["bachi_types"];
  const lure_images = row.lure_images ?? [];
  const { lure_bachi_types: _bachi, lure_images: _images, ...base } = row;
  return {
    ...base,
    bachi_types,
    image_url: pickPrimaryImageUrl(lure_images as LureImage[])
  };
}

export async function getTopStats() {
  const supabase = createSupabaseServerClient();
  const [{ count: lureCount }, { count: fishedCount }] = await Promise.all([
    supabase.from("lures").select("id", { count: "exact", head: true }),
    // 評価（rating）あり＝管理人が実釣したルアー。未評価は掲載のみで実釣インプレ対象外。
    supabase.from("lures").select("id", { count: "exact", head: true }).not("rating", "is", null)
  ]);

  return {
    lureCount: lureCount ?? 0,
    fishedCount: fishedCount ?? 0
  };
}

export async function getRecommendedLures(limit = 5) {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("lures").select(LURE_SELECT).eq("rating", 5);

  const lures = ((data ?? []) as LureRowWithRelations[]).map(toLure);
  return shuffle(lures).slice(0, limit);
}

export async function getLures(filters?: {
  bachi?: string;
  type?: string;
  speed?: string;
  casting?: string;
  q?: string;
}) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("lures").select(LURE_SELECT).order("updated_at", { ascending: false });

  if (filters?.bachi && filters.bachi !== "all") {
    const { data: matches } = await supabase.from("lure_bachi_types").select("lure_id").eq("bachi_type", filters.bachi);
    const lureIds = (matches ?? []).map((row) => row.lure_id);
    if (!lureIds.length) return [];
    query = query.in("id", lureIds);
  }
  if (filters?.type && filters.type !== "all") query = query.eq("lure_type", filters.type);
  if (filters?.speed && filters.speed !== "all") {
    const speed = filters.speed;
    query = query.or(`speed_range.eq.${speed},speed_range.eq.all,speed_range.ilike.%${speed}%`);
  }
  if (filters?.casting && filters.casting !== "all") query = query.eq("casting_distance", filters.casting);
  if (filters?.q) query = query.or(`name.ilike.%${filters.q}%,maker.ilike.%${filters.q}%`);

  const { data } = await query;
  return ((data ?? []) as LureRowWithRelations[]).map(toLure);
}

export async function getLureById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("lures").select(LURE_SELECT).eq("id", id).single();
  return data ? toLure(data as LureRowWithRelations) : null;
}

export async function getLureImages(lureId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("lure_images").select("*").eq("lure_id", lureId).order("sort_order");
  return (data ?? []) as LureImage[];
}

export async function getRelatedLures(lureId: string, bachiTypes: string[]) {
  const supabase = createSupabaseServerClient();
  if (!bachiTypes.length) return [];
  const { data: relationRows } = await supabase
    .from("lure_bachi_types")
    .select("lure_id")
    .in("bachi_type", bachiTypes)
    .neq("lure_id", lureId);
  const lureIds = Array.from(new Set((relationRows ?? []).map((row) => row.lure_id)));
  if (!lureIds.length) return [];
  const { data } = await supabase
    .from("lures")
    .select(LURE_SELECT)
    .in("id", lureIds)
    .neq("id", lureId)
    .limit(3);

  return ((data ?? []) as LureRowWithRelations[]).map(toLure);
}

export async function getLatestColumns(limit = 3) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("columns")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ColumnPost[];
}

export async function getColumns(category?: string) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("columns").select("*").order("published_at", { ascending: false });
  if (category && category !== "all") query = query.eq("category", category);
  const { data } = await query;
  return (data ?? []) as ColumnPost[];
}

export async function getColumnById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("columns").select("*").eq("id", id).single();
  return data as ColumnPost | null;
}

