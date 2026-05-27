/** 管理人コメントの冒頭を、句点区切りで自然に切り詰める */
export function excerptComment(
  comment: string | null | undefined,
  { maxLength = 150, maxSentences = 2 }: { maxLength?: number; maxSentences?: number } = {}
): string | null {
  if (!comment?.trim()) return null;

  const text = comment.replace(/\s+/g, " ").trim();
  const sentences = text
    .split("。")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!sentences.length) return null;

  let excerpt = "";
  let usedSentences = 0;

  for (const sentence of sentences) {
    if (usedSentences >= maxSentences) break;

    const piece = `${sentence}。`;
    const next = excerpt + piece;

    if (next.length > maxLength) {
      if (!excerpt) {
        return `${text.slice(0, maxLength).trimEnd()}…`;
      }
      break;
    }

    excerpt = next;
    usedSentences += 1;
  }

  if (!excerpt) return null;

  const isTruncated = excerpt.length < text.length || usedSentences < sentences.length;
  return isTruncated ? `${excerpt.replace(/。$/, "")}…` : excerpt;
}
