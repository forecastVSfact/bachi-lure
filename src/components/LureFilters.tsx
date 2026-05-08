"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BACHI_TYPES, BACHI_TYPE_LABEL, CASTING_DISTANCE_LABEL, LURE_TYPE_LABEL, SPEED_RANGE_LABEL } from "@/lib/constants";

export function LureFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const current = useMemo(
    () => ({
      bachi: params.get("bachi") ?? "all",
      type: params.get("type") ?? "all",
      speed: params.get("speed") ?? "all",
      casting: params.get("casting") ?? "all",
      q: params.get("q") ?? ""
    }),
    [params]
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`/lures?${next.toString()}`);
  };

  return (
    <div className="mb-8 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {["all", ...BACHI_TYPES].map((b) => (
          <button key={b} onClick={() => setParam("bachi", b)} className={`filter-tab ${current.bachi === b ? "active" : ""}`}>
            {b === "all" ? "すべて" : BACHI_TYPE_LABEL[b] ?? b}
          </button>
        ))}
      </div>
      <div className="field-dark grid gap-2 rounded p-3 md:grid-cols-4">
        <select className="field-dark px-2 py-2 text-sm" value={current.type} onChange={(e) => setParam("type", e.target.value)}>
          <option value="all">タイプ</option>
          <option value="floating">{LURE_TYPE_LABEL.floating}</option>
          <option value="sinking">{LURE_TYPE_LABEL.sinking}</option>
        </select>
        <select className="field-dark px-2 py-2 text-sm" value={current.speed} onChange={(e) => setParam("speed", e.target.value)}>
          <option value="all">速度域</option>
          <option value="dead_slow">{SPEED_RANGE_LABEL.dead_slow}</option>
          <option value="slow">{SPEED_RANGE_LABEL.slow}</option>
          <option value="medium">{SPEED_RANGE_LABEL.medium}</option>
        </select>
        <select className="field-dark px-2 py-2 text-sm" value={current.casting} onChange={(e) => setParam("casting", e.target.value)}>
          <option value="all">飛距離</option>
          <option value="short">{CASTING_DISTANCE_LABEL.short}</option>
          <option value="medium">{CASTING_DISTANCE_LABEL.medium}</option>
          <option value="long">{CASTING_DISTANCE_LABEL.long}</option>
        </select>
        <input
          className="field-dark px-2 py-2 text-sm"
          placeholder="ルアー名・メーカー"
          value={current.q}
          onChange={(e) => setParam("q", e.target.value)}
        />
      </div>
    </div>
  );
}

