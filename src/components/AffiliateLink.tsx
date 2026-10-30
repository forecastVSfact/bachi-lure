"use client";

import type { ReactNode } from "react";

type AffiliateLinkProps = {
  href: string;
  store: "amazon" | "rakuten";
  lureId: string;
  lureName: string;
  className?: string;
  children: ReactNode;
};

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/** アフィリエイトリンク。rel="sponsored" を付け、GA4にクリックを記録する */
export function AffiliateLink({ href, store, lureId, lureName, className, children }: AffiliateLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={className}
      onClick={() => {
        (window as GtagWindow).gtag?.("event", "affiliate_click", {
          store,
          lure_id: lureId,
          lure_name: lureName,
          link_url: href
        });
      }}
    >
      {children}
    </a>
  );
}
