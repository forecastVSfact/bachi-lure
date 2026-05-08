"use client";

import { useState } from "react";
import type { LureImage } from "@/types/db";

export function LureGallery({ images }: { images: LureImage[] }) {
  const [index, setIndex] = useState(0);
  const list = images.length ? images : [{ id: "placeholder", lure_id: "", storage_path: null, external_url: "/placeholder.svg", sort_order: 0, created_at: "" }];
  const current = list[index]?.external_url || "/placeholder.svg";

  return (
    <div>
      <img
        src={current}
        alt="lure"
        className="h-72 w-full rounded border border-[var(--border)] bg-[var(--water-mid)] object-cover"
      />
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {list.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex(i)}
            className={`h-16 w-16 overflow-hidden rounded border ${i === index ? "border-[var(--teal)]" : "border-[var(--border)]"}`}
          >
            <img src={img.external_url || "/placeholder.svg"} alt="thumb" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

