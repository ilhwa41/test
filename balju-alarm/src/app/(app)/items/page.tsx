"use client";

import Link from "next/link";
import { useState } from "react";
import { useData, useNow } from "@/components/data";
import { ItemCard } from "@/components/ItemCard";
import { toItemViews } from "@/lib/inventory";
import type { Status } from "@/lib/types";

type Filter = "all" | "reorder" | "warning" | "normal";

const FILTERS: { value: Filter; label: string; statuses: Status[] }[] = [
  { value: "all", label: "전체", statuses: ["urgent", "reorder", "warning", "normal"] },
  { value: "reorder", label: "발주 필요", statuses: ["urgent", "reorder"] },
  { value: "warning", label: "주의", statuses: ["warning"] },
  { value: "normal", label: "정상", statuses: ["normal"] },
];

export default function ItemsPage() {
  const data = useData();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("all");
  if (data.status !== "ready") return null;

  const statuses = FILTERS.find((option) => option.value === filter)?.statuses ?? [];
  const views = toItemViews(data.items, data.logs, now).filter((view) => statuses.includes(view.status));

  return (
    <>
      <div className="sec-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          전체 품목
        </h1>
        <Link className="more" href="/items/new">
          품목 추가 ›
        </Link>
      </div>
      <div className="tabs">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === filter ? "on" : undefined}
            aria-pressed={option.value === filter}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="stack">
        {views.map((view) => (
          <ItemCard key={view.item.id} view={view} />
        ))}
        {!views.length && <p className="card empty">해당하는 품목이 없어요</p>}
      </div>
    </>
  );
}
