"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { formatNumber } from "@/lib/format";
import { recommendedReorderPoint, toItemViews } from "@/lib/inventory";
import { errorMessage } from "./errors";
import { useData, useNow, useStore } from "./data";
import { ItemCard } from "./ItemCard";
import { LogList } from "./LogList";
import { useToast } from "./toast";

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const data = useData();
  const now = useNow();
  const toast = useToast();
  const [error, setError] = useState("");
  if (data.status !== "ready") return null;

  const view = toItemViews(data.items, data.logs, now).find((candidate) => candidate.item.id === id);
  if (!view) return <p className="card empty">품목을 찾을 수 없어요</p>;

  const { item, dailyUsage, days } = view;
  const recommended = recommendedReorderPoint(dailyUsage, item.leadTimeDays, item.safetyStock);
  const tooLate = days !== null && item.leadTimeDays > 0 && days < item.leadTimeDays;
  const amount = (value: number | null) => (value === null ? "-" : `${formatNumber(value)}${item.unit}`);

  async function remove() {
    if (!store) return;
    if (!window.confirm(`${item.name} 품목을 삭제할까요? 사용·입고 기록은 남습니다.`)) return;
    try {
      await store.deleteItem(item.id);
      toast(`${item.name} 삭제했어요`);
      router.push("/items");
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <>
      <h1 className="page-title">{item.name}</h1>
      <div className="stack">
        <ItemCard view={view} linked={false} />
        <section className="card">
          <div className="actions">
            <Link className="btn btn-sm btn-blue" href={`/input?tab=use&item=${item.id}`}>
              사용 입력
            </Link>
            <Link className="btn btn-sm btn-green" href={`/input?tab=in&item=${item.id}`}>
              입고 입력
            </Link>
            <Link className="btn btn-sm btn-white" href={`/items/${item.id}/edit`}>
              품목 수정
            </Link>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => void remove()}>
              삭제
            </button>
          </div>
          <div className="facts">
            <div>
              <span>발주 알림 기준</span>
              <strong>{amount(item.reorderPoint)}</strong>
            </div>
            <div>
              <span>긴급 알림 기준</span>
              <strong>{amount(item.urgentPoint)}</strong>
            </div>
            <div>
              <span>최대 보관량</span>
              <strong>{amount(item.maxStorage)}</strong>
            </div>
            <div>
              <span>{item.dailyUsage ? "하루 사용량" : "하루 사용량 (최근 기록)"}</span>
              <strong>{dailyUsage === null ? "-" : amount(Math.round(dailyUsage * 10) / 10)}</strong>
            </div>
            <div>
              <span>입고까지</span>
              <strong>{item.leadTimeDays ? `${formatNumber(item.leadTimeDays)}일` : "-"}</strong>
            </div>
            <div>
              <span>추천 발주점 (참고)</span>
              <strong>{amount(recommended)}</strong>
            </div>
          </div>
          {item.supplierName && <p className="hint" style={{ marginTop: 14 }}>발주처: {item.supplierName}</p>}
          {tooLate && (
            <p className="warn">
              지금 발주해도 입고({formatNumber(item.leadTimeDays)}일 뒤)보다 재고가 먼저 떨어져요 (D-{days}).
            </p>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
        <section>
          <div className="sec-head">
            <h2>사용·입고 기록</h2>
          </div>
          <LogList logs={data.logs.filter((log) => log.itemId === item.id)} items={data.items} />
        </section>
      </div>
    </>
  );
}
