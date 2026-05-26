/**
 * List lure counts and duplicate groups (name+maker, normalized).
 * Usage: npx ts-node scripts/audit-lures.ts
 */
import { createClient } from "@supabase/supabase-js";

function normalizeKey(name: string, maker: string): string {
  return `${name}|||${maker}`.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: lures, error } = await supabase
    .from("lures")
    .select("id,name,maker,updated_at")
    .order("name");
  if (error || !lures) {
    console.error(error?.message);
    process.exit(1);
  }

  console.log(`Total: ${lures.length}`);

  const exact = new Map<string, typeof lures>();
  for (const lure of lures) {
    const k = `${lure.name}|||${lure.maker}`;
    const list = exact.get(k) ?? [];
    list.push(lure);
    exact.set(k, list);
  }

  const exactDups = Array.from(exact.entries()).filter(([, list]) => list.length > 1);
  if (exactDups.length) {
    console.log("\nExact duplicates (name + maker):");
    for (const [k, list] of exactDups) {
      console.log(`  ${k.replace("|||", " / ")} (${list.length})`);
      for (const lure of list) console.log(`    - ${lure.id}`);
    }
  } else {
    console.log("Exact duplicates (name + maker): none");
  }

  const norm = new Map<string, typeof lures>();
  for (const lure of lures) {
    const k = normalizeKey(lure.name, lure.maker);
    const list = norm.get(k) ?? [];
    list.push(lure);
    norm.set(k, list);
  }

  const normDups = Array.from(norm.entries()).filter(([, list]) => list.length > 1);
  if (normDups.length) {
    console.log("\nNormalized duplicates (spacing/case ignored):");
    for (const [, list] of normDups) {
      console.log(`  ${list[0].name} / ${list[0].maker} (${list.length})`);
      for (const lure of list) console.log(`    - ${lure.id}  maker="${lure.maker}"`);
    }
  } else {
    console.log("Normalized duplicates: none");
  }

  const byName = new Map<string, number>();
  for (const lure of lures) {
    byName.set(lure.name, (byName.get(lure.name) ?? 0) + 1);
  }
  const nameOnly = Array.from(byName.entries()).filter(([, c]) => c > 1);
  if (nameOnly.length) {
    console.log("\nSame name, different maker (may look like dupes in UI):");
    for (const [name, count] of nameOnly.sort((a, b) => b[1] - a[1])) {
      const makers = lures.filter((l) => l.name === name).map((l) => l.maker);
      console.log(`  ${name} x${count}: ${makers.join(", ")}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
