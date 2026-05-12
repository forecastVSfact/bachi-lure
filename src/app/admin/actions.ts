"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { BACHI_TYPES } from "@/lib/constants";

export async function loginAdmin(_: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function upsertLure(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
  const id = payload.id || undefined;
  const selectedBachiTypes = formData
    .getAll("bachi_types")
    .map((value) => String(value))
    .filter((value): value is (typeof BACHI_TYPES)[number] => BACHI_TYPES.includes(value as (typeof BACHI_TYPES)[number]));

  const { data: lure } = await supabase
    .from("lures")
    .upsert({
      ...(id ? { id } : {}),
      name: payload.name,
      maker: payload.maker,
      lure_type: payload.lure_type,
      swim_posture: payload.swim_posture,
      speed_range: payload.speed_range,
      casting_distance: payload.casting_distance,
      size_mm: payload.size_mm ? Number(payload.size_mm) : null,
      weight_g: payload.weight_g ? Number(payload.weight_g) : null,
      price_yen: payload.price_yen ? Number(payload.price_yen) : null,
      hook_size: payload.hook_size || null,
      action: payload.action || null,
      range_min_cm: payload.range_min_cm ? Number(payload.range_min_cm) : null,
      range_max_cm: payload.range_max_cm ? Number(payload.range_max_cm) : null,
      youtube_url: payload.youtube_url || null,
      amazon_url: payload.amazon_url || null,
      rakuten_url: payload.rakuten_url || null,
      rating: payload.rating ? Number(payload.rating) : null,
      comment: payload.comment || null
    })
    .select("id")
    .single();

  if (lure?.id) {
    await supabase.from("lure_bachi_types").delete().eq("lure_id", lure.id);
    if (selectedBachiTypes.length) {
      await supabase.from("lure_bachi_types").insert(
        selectedBachiTypes.map((bachiType) => ({
          lure_id: lure.id,
          bachi_type: bachiType
        }))
      );
    }

    const externalUrls = (payload.image_urls || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const storagePaths = (payload.storage_paths || "").split("\n").map((x) => x.trim()).filter(Boolean);

    await supabase.from("lure_images").delete().eq("lure_id", lure.id);

    const rows = [
      ...externalUrls.map((url, i) => ({ lure_id: lure.id, external_url: url, storage_path: null, sort_order: i })),
      ...storagePaths.map((path, i) => ({ lure_id: lure.id, external_url: null, storage_path: path, sort_order: i + externalUrls.length }))
    ];

    if (rows.length) await supabase.from("lure_images").insert(rows);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteLure(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("lures").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
}

export async function upsertColumn(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
  await supabase.from("columns").upsert({
    ...(payload.id ? { id: payload.id } : {}),
    title: payload.title,
    category: payload.category,
    body: payload.body,
    published_at: payload.published_at || null
  });
  revalidatePath("/admin");
}

export async function deleteColumn(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("columns").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
}

