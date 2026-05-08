import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ColumnPost, Lure, LureImage } from "@/types/db";

export async function getTopStats() {
  const supabase = createSupabaseServerClient();
  const [{ count: lureCount }, { count: impressionCount }] = await Promise.all([
    supabase.from("lures").select("id", { count: "exact", head: true }),
    supabase.from("lures").select("id", { count: "exact", head: true }).not("comment", "is", null)
  ]);

  return {
    lureCount: lureCount ?? 0,
    bachiTypeCount: 5,
    impressionCount: impressionCount ?? 0
  };
}

export async function getRecommendedLures(limit = 5) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("lures")
    .select("*")
    .eq("rating", 5)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Lure[];
}

export async function getLures(filters?: {
  bachi?: string;
  type?: string;
  speed?: string;
  casting?: string;
  q?: string;
}) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("lures").select("*").order("updated_at", { ascending: false });

  if (filters?.bachi && filters.bachi !== "all") query = query.eq("bachi_type", filters.bachi);
  if (filters?.type && filters.type !== "all") query = query.eq("lure_type", filters.type);
  if (filters?.speed && filters.speed !== "all") query = query.eq("speed_range", filters.speed);
  if (filters?.casting && filters.casting !== "all") query = query.eq("casting_distance", filters.casting);
  if (filters?.q) query = query.or(`name.ilike.%${filters.q}%,maker.ilike.%${filters.q}%`);

  const { data } = await query;
  return (data ?? []) as Lure[];
}

export async function getLureById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("lures").select("*").eq("id", id).single();
  return data as Lure | null;
}

export async function getLureImages(lureId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("lure_images").select("*").eq("lure_id", lureId).order("sort_order");
  return (data ?? []) as LureImage[];
}

export async function getRelatedLures(lureId: string, bachiType: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("lures")
    .select("*")
    .eq("bachi_type", bachiType)
    .neq("id", lureId)
    .limit(3);

  return (data ?? []) as Lure[];
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

