"use client";

import { useParams } from "next/navigation";
import { averageDailyUsage } from "@/lib/inventory";
import { useData, useNow } from "./data";
import { ItemForm } from "./ItemForm";

export function ItemEdit() {
  const { id } = useParams<{ id: string }>();
  const data = useData();
  const now = useNow();
  if (data.status !== "ready") return null;

  const item = data.items.find((candidate) => candidate.id === id);
  if (!item) return <p className="card empty">품목을 찾을 수 없어요</p>;

  return (
    <>
      <h1 className="page-title">품목 수정</h1>
      {/* 재고가 입력으로 바뀌면 폼을 새로 만들어, 오래된 재고값으로 보정 기록이 생기지 않게 한다. */}
      <ItemForm
        key={item.updatedAt.getTime()}
        item={item}
        usageFromLogs={averageDailyUsage(data.logs, item.id, now)}
      />
    </>
  );
}
