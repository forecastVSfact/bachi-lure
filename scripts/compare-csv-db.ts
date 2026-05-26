/**
 * Compare luredatabase/lures.csv with Supabase lures.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

function key(name: string, maker: string): string {
  return `${name}|||${maker}`.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const csvPath = path.join(process.cwd(), "luredatabase", "lures.csv");
  const csvText = fs.readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, "");
  const rows = parse(csvText, { columns: true, skip_empty_lines: true }) as Array<{
    name: string;
    maker: string;
  }>;

  const supabase = createClient(url, serviceKey);
  const { data: lures, error } = await supabase.from("lures").select("id,name,maker");
  if (error || !lures) {
    console.error(error?.message);
    process.exit(1);
  }

  const csvKeys = new Set(rows.map((r) => key(r.name, r.maker)));
  const dbKeys = new Set(lures.map((l) => key(l.name, l.maker)));

  const onlyDb = lures.filter((l) => !csvKeys.has(key(l.name, l.maker)));
  const onlyCsv = rows.filter((r) => !dbKeys.has(key(r.name, r.maker)));

  console.log(`CSV: ${rows.length}, DB: ${lures.length}`);
  if (onlyDb.length) {
    console.log("\nIn DB only (not in CSV — possible stray/duplicate):");
    for (const l of onlyDb) console.log(`  ${l.name} / ${l.maker}  ${l.id}`);
  }
  if (onlyCsv.length) {
    console.log("\nIn CSV only (not in DB):");
    for (const r of onlyCsv) console.log(`  ${r.name} / ${r.maker}`);
  }
  if (!onlyDb.length && !onlyCsv.length) console.log("CSV and DB keys match 1:1");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
