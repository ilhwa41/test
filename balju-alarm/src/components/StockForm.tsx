"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatNumber, occurredAtFrom, toDateInput } from "@/lib/format";
import { errorMessage } from "./errors";
import { useData, useNow, useStore } from "./data";
import { useToast } from "./toast";

export function StockForm() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const data = useData();
  const now = useNow();
  const toast = useToast();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const type = params.get("tab") === "in" ? "in" : "out";
  const itemId = params.get("item") ?? "";
  const items = data.status === "ready" ? data.items : [];
  const query = (tab: string) => `/input?tab=${tab}${itemId ? `&item=${encodeURIComponent(itemId)}` : ""}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const quantity = Number(values.get("quantity"));
    const occurredAt = occurredAtFrom(String(values.get("date")), new Date());
    const item = items.find((candidate) => candidate.id === values.get("itemId"));

    if (!item) return setError("품목을 선택해 주세요.");
    if (!(quantity > 0)) return setError("수량을 0보다 큰 숫자로 입력해 주세요.");
    if (!occurredAt) return setError("오늘까지의 날짜를 입력해 주세요.");

    setBusy(true);
    setError("");
    try {
      await store.recordStock({
        itemId: item.id,
        type,
        quantity,
        memo: String(values.get("memo")).trim(),
        occurredAt,
      });
      form.reset();
      toast(`${item.name} ${formatNumber(quantity)}${item.unit} ${type === "in" ? "입고" : "사용"} 저장했어요`);
      router.push("/");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  if (data.status !== "ready") return null;

  return (
    <>
      <h1 className="page-title">입력하기</h1>
      <div className="tabs">
        <Link className={type === "out" ? "on" : undefined} href={query("use")}>
          사용 입력
        </Link>
        <Link className={type === "in" ? "on" : undefined} href={query("in")}>
          입고 입력
        </Link>
      </div>
      {items.length ? (
        <form className="card form" key={`${type}-${itemId}`} onSubmit={submit} noValidate>
          <label className="field">
            <span>품목</span>
            <select name="itemId" defaultValue={itemId}>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (남은 {formatNumber(item.currentStock)}
                  {item.unit})
                </option>
              ))}
            </select>
          </label>
          <div className="grid2">
            <label className="field">
              <span>수량</span>
              <input name="quantity" type="number" inputMode="decimal" min="0" step="any" />
            </label>
            <label className="field">
              <span>날짜</span>
              <input name="date" type="date" defaultValue={toDateInput(now)} max={toDateInput(now)} />
            </label>
          </div>
          <label className="field">
            <span>메모 (선택)</span>
            <input name="memo" maxLength={100} />
          </label>
          <p className="error" role="alert">
            {error}
          </p>
          <button className={`btn ${type === "in" ? "btn-green" : "btn-blue"}`} disabled={busy}>
            저장
          </button>
        </form>
      ) : (
        <div className="card empty">
          <p>먼저 품목을 추가해 주세요</p>
          <p>
            <Link className="more" href="/items/new">
              품목 추가 ›
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
