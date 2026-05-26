import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

type CsvRow = Record<string, string>;

const CANONICAL_SPEED = new Set(["dead_slow", "slow", "medium", "all"]);

function parseImageUrls(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function setLureImages(
  supabase: ReturnType<typeof createClient>,
  lureId: string,
  urls: string[]
) {
  await supabase.from("lure_images").delete().eq("lure_id", lureId);
  if (!urls.length) return;

  const { error } = await supabase.from("lure_images").insert(
    urls.map((external_url, sort_order) => ({
      lure_id: lureId,
      external_url,
      storage_path: null,
      sort_order
    }))
  );
  if (error) throw new Error(error.message);
}

function lureKey(name: string, maker: string): string {
  return `${name}|||${maker}`.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function normalizeSpeedRange(raw: string | undefined): string {
  if (!raw?.trim()) return "all";
  const parts = raw.replace(/、/g, ",").split(",").map((p) => p.trim().toLowerCase().replace(/-/g, "_"));
  const canonical = new Set<string>();
  for (const part of parts) {
    let key = part;
    if (key === "deadslow") key = "dead_slow";
    if (key === "fast" || key === "medium_fast") key = "medium";
    if (CANONICAL_SPEED.has(key)) canonical.add(key);
  }
  if (canonical.size === 0) return "all";
  if (canonical.size === 1) return Array.from(canonical)[0];
  return "all";
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx ts-node scripts/import-csv.ts lures.csv");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const csvText = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  const rows = parse(csvText, { columns: true, skip_empty_lines: true }) as CsvRow[];
  const supabase = createClient(url, key);

  const { data: existingLures, error: loadError } = await supabase.from("lures").select("id,name,maker");
  if (loadError) {
    console.error("Failed to load existing lures", loadError.message);
    process.exit(1);
  }

  const idByKey = new Map<string, string>();
  for (const lure of existingLures ?? []) {
    idByKey.set(lureKey(lure.name, lure.maker), lure.id);
  }

  for (const row of rows) {
    const bachiTypes = (row.bachi_types || row.bachi_type || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const existingId = row.id?.trim() || idByKey.get(lureKey(row.name, row.maker));

    const payload = {
      id: existingId || undefined,
      name: row.name,
      maker: row.maker,
      lure_type: row.lure_type,
      swim_posture: row.swim_posture,
      speed_range: normalizeSpeedRange(row.speed_range),
      casting_distance: row.casting_distance,
      size_mm: row.size_mm ? Number(row.size_mm) : null,
      weight_g: row.weight_g ? Number(row.weight_g) : null,
      price_yen: row.price_yen ? Number(row.price_yen) : null,
      hook_size: row.hook_size || null,
      action: row.action || null,
      range_min_cm: row.range_min_cm ? Number(row.range_min_cm) : null,
      range_max_cm: row.range_max_cm ? Number(row.range_max_cm) : null,
      youtube_url: row.youtube_url || null,
      amazon_url: row.amazon_url || null,
      rakuten_url: row.rakuten_url || null,
      rating: row.rating ? Number(row.rating) : null,
      comment: row.comment || null
    };

    const { data: lure, error: upsertError } = await supabase
      .from("lures")
      .upsert(payload)
      .select("id")
      .single();

    if (upsertError || !lure) {
      console.error(`Failed to upsert lure: ${row.name}`, upsertError?.message);
      process.exit(1);
    }

    idByKey.set(lureKey(row.name, row.maker), lure.id);

    const { error: deleteError } = await supabase.from("lure_bachi_types").delete().eq("lure_id", lure.id);
    if (deleteError) {
      console.error(`Failed to clear bachi types for: ${row.name}`, deleteError.message);
      process.exit(1);
    }

    if (bachiTypes.length) {
      const { error: relationError } = await supabase.from("lure_bachi_types").insert(
        bachiTypes.map((bachiType) => ({
          lure_id: lure.id,
          bachi_type: bachiType
        }))
      );
      if (relationError) {
        console.error(`Failed to insert bachi types for: ${row.name}`, relationError.message);
        process.exit(1);
      }
    }

    const imageUrls = parseImageUrls(row.image_urls || row.image_url);
    if (imageUrls.length) {
      try {
        await setLureImages(supabase, lure.id, imageUrls);
      } catch (imageError) {
        console.error(`Failed to insert images for: ${row.name}`, imageError);
        process.exit(1);
      }
    }
  }

  console.log(`Imported ${rows.length} lures from ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

