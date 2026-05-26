import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "lure-images";
const IMAGE_DIR = path.join(process.cwd(), "luredatabase", "images");
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function normalizeKey(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function contentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

async function ensureBucket(supabase: SupabaseClient) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((bucket) => bucket.name === BUCKET)) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024
  });
  if (error) throw new Error(`Failed to create bucket: ${error.message}`);
}

async function setLureImages(
  supabase: SupabaseClient,
  lureId: string,
  rows: Array<{ external_url: string | null; storage_path: string | null; sort_order: number }>
) {
  await supabase.from("lure_images").delete().eq("lure_id", lureId);
  if (rows.length) {
    const { error } = await supabase.from("lure_images").insert(
      rows.map((row) => ({ lure_id: lureId, ...row })) as Record<string, unknown>[]
    );
    if (error) throw new Error(error.message);
  }
}

function parseOnlyArg(): Set<string> | null {
  const idx = process.argv.indexOf("--only");
  if (idx === -1) return null;
  const raw = process.argv[idx + 1];
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((part) => normalizeKey(part.trim()))
      .filter(Boolean)
  );
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const only = parseOnlyArg();

  if (!fs.existsSync(IMAGE_DIR)) {
    console.error(`Image folder not found: ${IMAGE_DIR}`);
    console.error("Create it and add files named like the lure (e.g. ノガレ120F.jpg)");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  await ensureBucket(supabase);

  const { data: lures, error: lureError } = await supabase.from("lures").select("id, name, maker");
  if (lureError || !lures) {
    console.error("Failed to load lures", lureError?.message);
    process.exit(1);
  }

  const byName = new Map<string, Array<{ id: string; name: string; maker: string }>>();
  for (const lure of lures) {
    const keyName = normalizeKey(lure.name);
    const list = byName.get(keyName) ?? [];
    list.push(lure);
    byName.set(keyName, list);
  }

  const files = fs
    .readdirSync(IMAGE_DIR)
    .filter((file) => EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort();

  if (!files.length) {
    console.error(`No image files in ${IMAGE_DIR}`);
    process.exit(1);
  }

  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const stem = path.parse(file).name;
    if (only && !only.has(normalizeKey(stem))) {
      continue;
    }
    const matches = byName.get(normalizeKey(stem));
    if (!matches?.length) {
      console.warn(`Skip (no lure match): ${file}`);
      skipped += 1;
      continue;
    }
    const localPath = path.join(IMAGE_DIR, file);
    const ext = path.extname(file).toLowerCase() || ".jpg";
    const body = fs.readFileSync(localPath);

    if (matches.length > 1) {
      console.warn(`Multiple DB rows for "${stem}" — applying image to all ${matches.length} entries`);
    }

    for (const lure of matches) {
      const storagePath = `${lure.id}/main${ext}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, body, {
        upsert: true,
        contentType: contentType(localPath)
      });
      if (uploadError) {
        console.error(`Failed to upload ${file} for ${lure.id}:`, uploadError.message);
        process.exit(1);
      }

      await setLureImages(supabase, lure.id, [{ external_url: null, storage_path: storagePath, sort_order: 0 }]);
      console.log(`OK: ${lure.name} (${lure.id.slice(0, 8)}…) <- ${file}`);
      uploaded += 1;
    }
  }

  console.log(`Uploaded ${uploaded} images (${skipped} skipped)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
