import { SITE_URL } from "@/lib/seo";
import type { ColumnPost } from "@/types/db";

export function resolveColumnOgImage(column: ColumnPost): string | null {
  if (column.og_image?.trim()) {
    const src = column.og_image.trim();
    return src.startsWith("http") ? src : `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
  }

  const match = column.body.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (!match?.[1]) return null;

  const src = match[1].trim();
  return src.startsWith("http") ? src : `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export function extractYouTubeIds(body: string): string[] {
  const ids = new Set<string>();
  const patterns = [/youtube\.com\/watch\?v=([\w-]+)/g, /youtu\.be\/([\w-]+)/g];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(body)) !== null) {
      if (match[1]) ids.add(match[1]);
    }
  }

  return Array.from(ids);
}

export function columnKeywords(column: ColumnPost): string[] {
  if (column.keywords?.length) return column.keywords;

  return ["バチ抜け", "シーバス", column.category];
}

export function columnMetaDescription(column: ColumnPost): string {
  return (
    column.meta_description?.trim() ||
    column.body.replace(/\s+/g, " ").trim().slice(0, 120) ||
    `${column.category}に関する管理人コラム。`
  );
}
