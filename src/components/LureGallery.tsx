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
      <div className="flex h-72 w-full items-center justify-center rounded border border-[var(--border)] bg-[var(--water-mid)] p-4">
        <img src={current} alt={alt} className="max-h-full max-w-full object-contain" />
      </div>
      {list.length > 1 ? (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded border bg-[var(--water-mid)] p-1 ${i === index ? "border-[var(--teal)]" : "border-[var(--border)]"}`}
            >
              <img src={resolveUrl(img)} alt="" className="max-h-full max-w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

