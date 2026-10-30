import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { AffiliateLink } from "@/components/AffiliateLink";

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="youtube-embed">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube動画"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function paragraphText(children: ReactNode): string {
  if (typeof children === "string") return children.trim();
  if (Array.isArray(children)) {
    return children
      .map((child) => (typeof child === "string" ? child : ""))
      .join("")
      .trim();
  }
  return "";
}

function affiliateStore(href: string): "amazon" | "rakuten" | null {
  try {
    const host = new URL(href).hostname;
    if (host.endsWith("amazon.co.jp")) return "amazon";
    if (host.endsWith("rakuten.co.jp")) return "rakuten";
  } catch {
    return null;
  }
  return null;
}

/** リンク先の検索語から商品名を取り出す(GA4のlure_name用)。取れなければ空文字 */
function affiliateProductName(href: string): string {
  try {
    const url = new URL(href);
    const amazonKeyword = url.searchParams.get("k");
    if (amazonKeyword) return amazonKeyword;
    const pc = url.searchParams.get("pc");
    if (pc) {
      const segments = new URL(pc).pathname.split("/").filter(Boolean);
      return decodeURIComponent(segments[segments.length - 1] ?? "");
    }
  } catch {
    return "";
  }
  return "";
}

function createMarkdownComponents(sourceId: string): Components {
  return {
  p: ({ children }) => {
    const text = paragraphText(children);
    const videoId = parseYouTubeId(text);
    if (videoId) return <YouTubeEmbed id={videoId} />;
    return <p>{children}</p>;
  },
  a: ({ href, children }) => {
    const videoId = href ? parseYouTubeId(href) : null;
    if (videoId) return <YouTubeEmbed id={videoId} />;
    if (href?.startsWith("/")) return <Link href={href}>{children}</Link>;
    const store = href ? affiliateStore(href) : null;
    if (href && store) {
      return (
        <AffiliateLink href={href} store={store} lureId={`column:${sourceId}`} lureName={affiliateProductName(href) || paragraphText(children)}>
          {children}
        </AffiliateLink>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  };
}

export function ColumnMarkdown({ children, sourceId }: { children: string; sourceId: string }) {
  return <ReactMarkdown components={createMarkdownComponents(sourceId)}>{children}</ReactMarkdown>;
}
