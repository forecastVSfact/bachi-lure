"use client";

import { useState } from "react";
import { BACHI_TYPE_LABEL, BACHI_TYPES } from "@/lib/constants";

export function AdminLureForm({ action }: { action: (formData: FormData) => void }) {
  const [lureType, setLureType] = useState("floating");

  return (
    <form action={action} className="grid gap-2 md:grid-cols-3">
      <input name="id" placeholder="id(編集時のみ)" className="field-dark p-2" />
      <input name="name" required placeholder="name" className="field-dark p-2" />
      <input name="maker" required placeholder="maker" className="field-dark p-2" />
      <select name="lure_type" value={lureType} onChange={(e) => setLureType(e.target.value)} className="field-dark p-2">
        <option value="floating">floating</option>
        <option value="sinking">sinking</option>
      </select>
      {lureType === "sinking" ? <input name="sinking_type" placeholder="sinking_type" className="field-dark p-2" /> : <div />}
      {lureType === "sinking" ? <input name="fall_posture" placeholder="fall_posture" className="field-dark p-2" /> : <div />}
      {lureType === "sinking" ? <input name="fall_type" placeholder="fall_type" className="field-dark p-2" /> : <div />}
      <input name="size_mm" placeholder="size_mm" className="field-dark p-2" />
      <input name="weight_g" placeholder="weight_g" className="field-dark p-2" />
      <input name="price_yen" placeholder="price_yen" className="field-dark p-2" />
      <input name="hook_size" placeholder="hook_size" className="field-dark p-2" />
      <input name="range_min_cm" placeholder="range_min_cm" className="field-dark p-2" />
      <input name="range_max_cm" placeholder="range_max_cm" className="field-dark p-2" />
      <input name="swim_posture" required placeholder="swim_posture" className="field-dark p-2" />
      <input name="speed_range" required placeholder="speed_range" className="field-dark p-2" />
      <input name="casting_distance" required placeholder="casting_distance" className="field-dark p-2" />
      <div className="field-dark p-3 md:col-span-3">
        <p className="mb-2 text-xs text-[var(--muted)]">バチ種別（複数選択可）</p>
        <div className="flex flex-wrap gap-3">
          {BACHI_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="bachi_types" value={type} />
              <span>{BACHI_TYPE_LABEL[type]}</span>
            </label>
          ))}
        </div>
      </div>
      <input name="youtube_url" placeholder="youtube_url" className="field-dark p-2" />
      <input name="amazon_url" placeholder="amazon_url" className="field-dark p-2" />
      <input name="rakuten_url" placeholder="rakuten_url" className="field-dark p-2" />
      <input name="rating" placeholder="rating" className="field-dark p-2" />
      <textarea name="image_urls" placeholder="外部画像URL(改行区切り)" className="field-dark p-2 md:col-span-3" />
      <textarea name="storage_paths" placeholder="Storageパス(改行区切り)" className="field-dark p-2 md:col-span-3" />
      <textarea name="comment" placeholder="comment" className="field-dark p-2 md:col-span-3" />
      <button className="rounded bg-[var(--teal)] px-4 py-2 text-white md:col-span-3">保存</button>
    </form>
  );
}

