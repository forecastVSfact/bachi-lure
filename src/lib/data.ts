import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ColumnPost, Lure, LureImage } from "@/types/db";

type LureRowWithRelations = Omit<Lure, "bachi_types"> & {
  lure_bachi_types?: Array<{ bachi_type: string }>;
};

function toLure(row: LureRowWithRelations): Lure {
  const bachi_types = (row.lure_bachi_types ?? []).map((item) => item.bachi_type).filter(Boolean) as Lure["bachi_types"];
  return {
    ...row,
    bachi_types
  };
}

export async function getTopStats() {
  const supabase = createSupabaseServerClient();
  const [{ count: lureCount }, { count: impressionCount }, { data: bachiRows }] = await Promise.all([
    supabase.from("lures").select("id", { count: "exact", head: true }),
    supabase.from("lures").select("id", { count: "exact", head: true }).not("comment", "is", null),
    supabase.from("lure_bachi_types").select("bachi_type")
  ]);

  const bachiTypeCount = new Set((bachiRows ?? []).map((row) => row.bachi_type)).size;

  return {
    lureCount: lureCount ?? 0,
    bachiTypeCount,
    impressionCount: impressionCount ?? 0
  };
}

export async function getRecommendedLures(limit = 5) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("lures")
    .select("*, lure_bachi_types(bachi_type)")
    .eq("rating", 5)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as LureRowWithRelations[]).map(toLure);
}

export async function getLures(filters?: {
  bachi?: string;
  type?: string;
  speed?: string;
  casting?: string;
  q?: string;
}) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("lures").select("*, lure_bachi_types(bachi_type)").order("updated_at", { ascending: false });

  if (filters?.bachi && filters.bachi !== "all") {
    const { data: matches } = await supabase.from("lure_bachi_types").select("lure_id").eq("bachi_type", filters.bachi);
    const lureIds = (matches ?? []).map((row) => row.lure_id);
    if (!lureIds.length) return [];
    query = query.in("id", lureIds);
  }
  if (filters?.type && filters.type !== "all") query = query.eq("lure_type", filters.type);
  if (filters?.speed && filters.speed !== "all") query = query.eq("speed_range", filters.speed);
  if (filters?.casting && filters.casting !== "all") query = query.eq("casting_distance", filters.casting);
  if (filters?.q) query = query.or(`name.ilike.%${filters.q}%,maker.ilike.%${filters.q}%`);

  const { data } = await query;
  return ((data ?? []) as LureRowWithRelations[]).map(toLure);
}

export async function getLureById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("lures").select("*, lure_bachi_types(bachi_type)").eq("id", id).single();
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
    .select("*, lure_bachi_types(bachi_type)")
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

