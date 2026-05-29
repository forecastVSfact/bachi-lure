import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

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

const markdownComponents: Components = {
  p: ({ children }) => {
    const text = paragraphText(children);
    const videoId = parseYouTubeId(text);
    if (videoId) return <YouTubeEmbed id={videoId} />;
    return <p>{children}</p>;
  },
  a: ({ href, children }) => {
    const videoId = href ? parseYouTubeId(href) : null;
    if (videoId) return <YouTubeEmbed id={videoId} />;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
};

export function ColumnMarkdown({ children }: { children: string }) {
  return <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>;
}
