import { createClient } from "@supabase/supabase-js";

// 使い方: npx ts-node scripts/list-lure-ids.ts [検索語 ...]
// 引数なしなら、コラム「バチ抜けにおけるワーム」で使う4本のIDを表示する(読み取りのみ)
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }
  const words = process.argv.slice(2);
  const targets = words.length ? words : ["ミドルアッパー", "アルカリ", "フリックシェイク", "タイドビート"];
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from("lures").select("id,name,maker").order("name");
  if (error) {
    console.error("Failed to load lures", error.message);
    process.exit(1);
  }
  for (const word of targets) {
    const hits = (data ?? []).filter((lure) => lure.name.includes(word));
    if (!hits.length) console.log(`${word}\t(見つかりません)`);
    for (const lure of hits) console.log(`${lure.name}\t${lure.maker}\t/lures/${lure.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
