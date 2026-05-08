import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

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
const rows = parse(csvText, { columns: true, skip_empty_lines: true });
const normalized = rows.map((row: Record<string, string>) => ({
  ...row,
  size_mm: row.size_mm ? Number(row.size_mm) : null,
  weight_g: row.weight_g ? Number(row.weight_g) : null,
  price_yen: row.price_yen ? Number(row.price_yen) : null,
  range_min_cm: row.range_min_cm ? Number(row.range_min_cm) : null,
  range_max_cm: row.range_max_cm ? Number(row.range_max_cm) : null,
  rating: row.rating ? Number(row.rating) : null
}));

const supabase = createClient(url, key);
const { error } = await supabase.from("lures").insert(normalized);
if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Imported ${normalized.length} lures from ${filePath}`);

