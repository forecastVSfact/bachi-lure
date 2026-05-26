/**
 * List lures that have no image file in luredatabase/images/
 * Usage: npx ts-node scripts/list-missing-images.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const IMAGE_DIR = path.join(process.cwd(), "luredatabase", "images");
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function normalizeKey(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: lures, error } = await supabase.from("lures").select("name").order("name");
  if (error || !lures) {
    console.error(error?.message);
    process.exit(1);
  }

  const stems = new Set<string>();
  if (fs.existsSync(IMAGE_DIR)) {
    for (const file of fs.readdirSync(IMAGE_DIR)) {
      if (EXTENSIONS.has(path.extname(file).toLowerCase())) {
        stems.add(normalizeKey(path.parse(file).name));
      }
    }
  }

  const missing = lures.filter((l) => !stems.has(normalizeKey(l.name)));
  console.log(`Lures: ${lures.length}, image files: ${stems.size}, missing files: ${missing.length}`);
  for (const lure of missing) {
    console.log(`  ${lure.name}.jpg`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
