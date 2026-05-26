/**
 * Remove duplicate lures (same name + maker). Keeps the richest record.
 * Usage: npx ts-node scripts/dedupe-lures.ts
 */
import { createClient } from "@supabase/supabase-js";

type LureRow = {
  id: string;
  name: string;
  maker: string;
  comment: string | null;
  updated_at: string;
};

function lureKey(name: string, maker: string): string {
  return `${name}|||${maker}`.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function score(row: LureRow, imageCount: number, bachiCount: number): number {
  let s = 0;
  if (row.comment?.trim()) s += 10;
  s += imageCount * 5;
  s += bachiCount * 2;
  s += new Date(row.updated_at).getTime() / 1e12;
  return s;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: lures, error } = await supabase.from("lures").select("id,name,maker,comment,updated_at");
  if (error || !lures) {
    console.error(error?.message);
    process.exit(1);
  }

  const groups = new Map<string, LureRow[]>();
  for (const lure of lures as LureRow[]) {
    const keyName = lureKey(lure.name, lure.maker);
    const list = groups.get(keyName) ?? [];
    list.push(lure);
    groups.set(keyName, list);
  }

  let removed = 0;
  for (const [keyName, list] of Array.from(groups.entries())) {
    if (list.length < 2) continue;

    const scored = await Promise.all(
      list.map(async (lure: LureRow) => {
        const [{ count: imageCount }, { count: bachiCount }] = await Promise.all([
          supabase.from("lure_images").select("id", { count: "exact", head: true }).eq("lure_id", lure.id),
          supabase.from("lure_bachi_types").select("lure_id", { count: "exact", head: true }).eq("lure_id", lure.id)
        ]);
        return { lure, score: score(lure, imageCount ?? 0, bachiCount ?? 0) };
      })
    );

    scored.sort((a, b) => b.score - a.score);
    const keep = scored[0].lure;
    const drop = scored.slice(1).map((x) => x.lure);

    console.log(`Keep: ${keep.name} (${keep.id}) — remove ${drop.length} duplicate(s)`);
    for (const lure of drop) {
      const { error: delError } = await supabase.from("lures").delete().eq("id", lure.id);
      if (delError) {
        console.error(`Failed to delete ${lure.id}:`, delError.message);
        process.exit(1);
      }
      removed += 1;
    }
  }

  console.log(`Removed ${removed} duplicate lure(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
