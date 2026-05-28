import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type ColumnFrontmatter = {
  id: string;
  title: string;
  category: string;
  meta_description?: string;
  published_at?: string;
};

function parseMarkdownFile(content: string): { frontmatter: ColumnFrontmatter; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Missing frontmatter (--- ... ---)");

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }

  const { id, title, category } = frontmatter;
  if (!id || !title || !category) {
    throw new Error("Frontmatter requires id, title, and category");
  }

  return {
    frontmatter: {
      id,
      title,
      category,
      meta_description: frontmatter.meta_description,
      published_at: frontmatter.published_at
    },
    body: match[2].trim()
  };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const columnsDir = path.join(process.cwd(), "content", "columns");
  if (!fs.existsSync(columnsDir)) {
    console.error(`Columns directory not found: ${columnsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(columnsDir).filter((name) => name.endsWith(".md"));
  if (files.length === 0) {
    console.log("No column markdown files found.");
    return;
  }

  const supabase = createClient(url, key);

  for (const file of files) {
    const filePath = path.join(columnsDir, file);
    const { frontmatter, body } = parseMarkdownFile(fs.readFileSync(filePath, "utf-8"));

    const payload = {
      id: frontmatter.id,
      title: frontmatter.title,
      category: frontmatter.category,
      body,
      meta_description: frontmatter.meta_description ?? null,
      published_at: frontmatter.published_at ?? null,
      updated_at: new Date().toISOString()
    };

    let { error } = await supabase.from("columns").upsert(payload);
    if (error?.message.includes("meta_description")) {
      const { meta_description: _meta, ...withoutMeta } = payload;
      console.warn(`Retrying ${file} without meta_description (run supabase/migrations/20260528_columns_text_id.sql first)`);
      ({ error } = await supabase.from("columns").upsert(withoutMeta));
    }

    if (error) {
      console.error(`Failed to upsert ${file}:`, error.message);
      process.exit(1);
    }

    console.log(`Imported column: ${frontmatter.id} (${frontmatter.title})`);
  }
}

main();
