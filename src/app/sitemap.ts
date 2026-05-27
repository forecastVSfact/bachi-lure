import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient();
  const [{ data: lures }, { data: columns }] = await Promise.all([
    supabase.from("lures").select("id,updated_at"),
    supabase.from("columns").select("id,updated_at")
  ]);

  const base = "https://www.bachi-lure.com";
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/lures`, lastModified: new Date() },
    { url: `${base}/columns`, lastModified: new Date() }
  ];

  const lurePages = (lures ?? []).map((l) => ({ url: `${base}/lures/${l.id}`, lastModified: l.updated_at ? new Date(l.updated_at) : new Date() }));
  const columnPages = (columns ?? []).map((c) => ({ url: `${base}/columns/${c.id}`, lastModified: c.updated_at ? new Date(c.updated_at) : new Date() }));

  return [...staticPages, ...lurePages, ...columnPages];
}

