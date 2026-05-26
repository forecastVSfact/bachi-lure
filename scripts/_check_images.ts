import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.from("lures").select("id, name, lure_images(id, external_url, storage_path)");
  if (error) {
    console.error(error);
    return;
  }
  
  const targets = ["ミドルアッパー", "アルカリ", "チキチータベイビー", "ザブラシステムミノー", "パンチライン", "トライデント", "ワンダー60", "にょろにょろ125", "ヒソカ"];
  const matches = data.filter(l => targets.some(t => l.name.includes(t)));
  console.dir(matches, {depth: null});
}

main().catch(console.error);
