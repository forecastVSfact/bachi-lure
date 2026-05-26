/**
 * Remove external image URLs from DB (site shows storage uploads only).
 * Usage: npx ts-node scripts/clear-external-image-urls.ts
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: rows, error } = await supabase
    .from("lure_images")
    .select("id, lure_id, external_url, storage_path")
    .not("external_url", "is", null);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!rows?.length) {
    console.log("No external image URLs in DB.");
    return;
  }

  let cleared = 0;
  let removed = 0;

  for (const row of rows) {
    if (row.storage_path?.trim()) {
      const { error: updError } = await supabase
        .from("lure_images")
        .update({ external_url: null })
        .eq("id", row.id);
      if (updError) {
        console.error(updError.message);
        process.exit(1);
      }
      cleared += 1;
    } else {
      const { error: delError } = await supabase.from("lure_images").delete().eq("id", row.id);
      if (delError) {
        console.error(delError.message);
        process.exit(1);
      }
      removed += 1;
    }
  }

  console.log(`Cleared external_url on ${cleared} row(s), removed ${removed} URL-only row(s).`);
  console.log("Run npm run import:images to upload from luredatabase/images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
