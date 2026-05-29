import type { MetadataRoute } from "next";
import { loadFileColumns } from "@/lib/column-content";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ColumnPost } from "@/types/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient();
  const [{ data: lures }, { data: columns }] = await Promise.all([
    supabase.from("lures").select("id,updated_at"),
    supabase.from("columns").select("id,updated_at")
  ]);

  const base = "https://www.bachi-lure.com";
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/lures`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/columns`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 }
  ];

  const lurePages = (lures ?? []).map((l) => ({
    url: `${base}/lures/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  const fileColumns = loadFileColumns();
  const dbColumns = (columns ?? []) as Pick<ColumnPost, "id" | "updated_at" | "published_at">[];
  const columnIds = new Set<string>();
  const columnPages: MetadataRoute.Sitemap = [];

  for (const column of [...dbColumns, ...fileColumns]) {
    if (columnIds.has(column.id)) continue;
    columnIds.add(column.id);
    const lastModified = column.updated_at ?? column.published_at;
    columnPages.push({
      url: `${base}/columns/${column.id}`,
      lastModified: lastModified ? new Date(lastModified) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    });
  }

  return [...staticPages, ...lurePages, ...columnPages];
}

