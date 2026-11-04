import fs from "node:fs";
import path from "node:path";
import type { ColumnPost } from "@/types/db";

const COLUMNS_DIR = path.join(process.cwd(), "content", "columns");

type ColumnFrontmatter = {
  id: string;
  title: string;
  category: string;
  meta_description?: string;
  og_image?: string;
  keywords?: string[];
  related_lures?: string[];
  published_at?: string;
};

function parseKeywords(raw: string | undefined): string[] | undefined {
  if (!raw?.trim()) return undefined;
  return raw
    .split(/[,、]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

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
      og_image: frontmatter.og_image,
      keywords: parseKeywords(frontmatter.keywords),
      related_lures: parseKeywords(frontmatter.related_lures),
      published_at: frontmatter.published_at
    },
    body: match[2].trim()
  };
}

function toColumnPost(frontmatter: ColumnFrontmatter, body: string, updatedAt: string): ColumnPost {
  const now = new Date().toISOString();
  return {
    id: frontmatter.id,
    title: frontmatter.title,
    category: frontmatter.category,
    body,
    meta_description: frontmatter.meta_description ?? null,
    og_image: frontmatter.og_image ?? null,
    keywords: frontmatter.keywords ?? null,
    related_lures: frontmatter.related_lures ?? null,
    published_at: frontmatter.published_at ?? null,
    created_at: updatedAt,
    updated_at: updatedAt
  };
}

export function loadFileColumns(): ColumnPost[] {
  if (!fs.existsSync(COLUMNS_DIR)) return [];

  return fs
    .readdirSync(COLUMNS_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const filePath = path.join(COLUMNS_DIR, name);
      const { frontmatter, body } = parseMarkdownFile(fs.readFileSync(filePath, "utf-8"));
      // 更新日は初回公開日(published_at)に固定する。ファイルのmtimeはデプロイのたびに全コラム同じ時刻になるため使わない。
      const publishedAt = frontmatter.published_at ? new Date(frontmatter.published_at) : null;
      const updatedAt =
        publishedAt && !Number.isNaN(publishedAt.getTime())
          ? publishedAt.toISOString()
          : fs.statSync(filePath).mtime.toISOString();
      return toColumnPost(frontmatter, body, updatedAt);
    })
    .sort((a, b) => {
      const aTime = a.published_at ?? a.updated_at;
      const bTime = b.published_at ?? b.updated_at;
      return bTime.localeCompare(aTime);
    });
}

export function getFileColumnById(id: string): ColumnPost | null {
  return loadFileColumns().find((column) => column.id === id) ?? null;
}

export function mergeColumns(dbColumns: ColumnPost[], fileColumns: ColumnPost[]): ColumnPost[] {
  const byId = new Map<string, ColumnPost>();
  for (const column of dbColumns) byId.set(column.id, column);
  for (const column of fileColumns) byId.set(column.id, column);
  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.published_at ?? a.updated_at;
    const bTime = b.published_at ?? b.updated_at;
    return bTime.localeCompare(aTime);
  });
}
