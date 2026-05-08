import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

type CsvRow = Record<string, string>;

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

  const csvText = fs.readFileSync(filePath, "utf-8");
  const rows = parse(csvText, { columns: true, skip_empty_lines: true }) as CsvRow[];
  const supabase = createClient(url, key);

  for (const row of rows) {
    const bachiTypes = (row.bachi_types || row.bachi_type || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const payload = {
      id: row.id || undefined,
      name: row.name,
      maker: row.maker,
      lure_type: row.lure_type,
      swim_posture: row.swim_posture,
      speed_range: row.speed_range,
      casting_distance: row.casting_distance,
      size_mm: row.size_mm ? Number(row.size_mm) : null,
      weight_g: row.weight_g ? Number(row.weight_g) : null,
      price_yen: row.price_yen ? Number(row.price_yen) : null,
      hook_size: row.hook_size || null,
      sinking_type: row.sinking_type || null,
      fall_posture: row.fall_posture || null,
      fall_type: row.fall_type || null,
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
  }

  console.log(`Imported ${rows.length} lures from ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

