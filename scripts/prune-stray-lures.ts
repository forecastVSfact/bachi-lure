/**
 * Delete lures in DB that are not present in luredatabase/lures.csv (by name+maker).
 * Usage: npx ts-node scripts/prune-stray-lures.ts [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

function lureKey(name: string, maker: string): string {
  return `${name}|||${maker}`.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const csvPath = path.join(process.cwd(), "luredatabase", "lures.csv");
  const csvText = fs.readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, "");
  const rows = parse(csvText, { columns: true, skip_empty_lines: true }) as Array<{
    name: string;
    maker: string;
  }>;
  const csvKeys = new Set(rows.map((r) => lureKey(r.name, r.maker)));

  const supabase = createClient(url, key);
  const { data: lures, error } = await supabase.from("lures").select("id,name,maker");
  if (error || !lures) {
    console.error(error?.message);
    process.exit(1);
  }

  const stray = lures.filter((l) => !csvKeys.has(lureKey(l.name, l.maker)));
  if (!stray.length) {
    console.log("No stray lures (DB matches CSV keys)");
    return;
  }

  for (const lure of stray) {
    console.log(`${dryRun ? "[dry-run] " : ""}Remove: ${lure.name} / ${lure.maker} (${lure.id})`);
    if (!dryRun) {
      const { error: delError } = await supabase.from("lures").delete().eq("id", lure.id);
      if (delError) {
        console.error(`Failed to delete ${lure.id}:`, delError.message);
        process.exit(1);
      }
    }
  }

  console.log(`${dryRun ? "Would remove" : "Removed"} ${stray.length} stray lure(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
