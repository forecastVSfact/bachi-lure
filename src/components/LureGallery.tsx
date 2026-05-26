"use client";

import { useState } from "react";
import { getLureImagePublicUrl } from "@/lib/lure-image";
import type { LureImage } from "@/types/db";

const PLACEHOLDER = "/placeholder.svg";

function resolveUrl(image: Pick<LureImage, "external_url" | "storage_path">): string {
  return getLureImagePublicUrl(image) ?? PLACEHOLDER;
}

export function LureGallery({ images, lureName }: { images: LureImage[]; lureName?: string }) {
  const [index, setIndex] = useState(0);
  const list = images.length
    ? [...images].sort((a, b) => a.sort_order - b.sort_order)
    : [{ id: "placeholder", lure_id: "", storage_path: null, external_url: PLACEHOLDER, sort_order: 0, created_at: "" }];
  const current = resolveUrl(list[index] ?? list[0]);
  const alt = lureName ? `${lureName}の画像` : "ルアー画像";

  return (
    <div>
      <img
        src={current}
        alt={alt}
        className="h-72 w-full rounded border border-[var(--border)] bg-[var(--water-mid)] object-cover"
      />
      {list.length > 1 ? (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-16 w-16 overflow-hidden rounded border ${i === index ? "border-[var(--teal)]" : "border-[var(--border)]"}`}
            >
              <img src={resolveUrl(img)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

