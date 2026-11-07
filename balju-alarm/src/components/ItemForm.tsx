"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatNumber } from "@/lib/format";
import { recommendedReorderPoint, validateItem } from "@/lib/inventory";
import type { Item, ItemIcon, ItemInput } from "@/lib/types";
import { errorMessage } from "./errors";
import { useStore } from "./data";
import { useToast } from "./toast";

const ICONS: { value: ItemIcon; label: string }[] = [
  { value: "yarn", label: "원사" },
  { value: "box", label: "상자" },
  { value: "tag", label: "라벨" },
  { value: "roll", label: "롤" },
];

type NumberField =
  | "currentStock" | "maxStorage" | "dailyUsage" | "leadTimeDays" | "reorderPoint" | "urgentPoint" | "safetyStock";
type Values = { name: string; unit: string; supplierName: string; icon: ItemIcon } & Record<NumberField, string>;

const text = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value));

function initialValues(item?: Item): Values {
  return {
    name: item?.name ?? "",
    unit: item?.unit ?? "개",
    supplierName: item?.supplierName ?? "",
    icon: item?.icon ?? "box",
    currentStock: text(item?.currentStock),
    maxStorage: text(item?.maxStorage),
    dailyUsage: text(item?.dailyUsage),
    leadTimeDays: text(item?.leadTimeDays),
    reorderPoint: text(item?.reorderPoint),
    urgentPoint: text(item?.urgentPoint),
    safetyStock: text(item?.safetyStock),
  };
}

function toInput(values: Values): ItemInput {
  return {
    name: values.name.trim(),
    unit: values.unit.trim() || "개",
    supplierName: values.supplierName.trim(),
    icon: values.icon,
    currentStock: Number(values.currentStock),
    maxStorage: Number(values.maxStorage),
    dailyUsage: values.dailyUsage === "" ? null : Number(values.dailyUsage),
    leadTimeDays: Number(values.leadTimeDays),
    reorderPoint: Number(values.reorderPoint),
    urgentPoint: Number(values.urgentPoint),
    safetyStock: Number(values.safetyStock),
  };
}

export function ItemForm({ item, usageFromLogs = null }: { item?: Item; usageFromLogs?: number | null }) {
  const router = useRouter();
  const store = useStore();
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(item));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const input = toInput(values);
  const recommended = recommendedReorderPoint(input.dailyUsage || usageFromLogs, input.leadTimeDays, input.safetyStock);
  const set = (name: keyof Values) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [name]: event.target.value }));

  const number = (name: NumberField, label: string, help?: string) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} type="number" inputMode="decimal" min="0" step="any" value={values[name]} onChange={set(name)} />
      {help && <small>{help}</small>}
    </label>
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store) return;
    const invalid = validateItem(input);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError("");
    try {
      const id = await store.saveItem(input, item?.id);
      if (!item) setValues(initialValues());
      toast(`${input.name} 저장했어요`);
      router.push(item ? `/items/${id}` : "/");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <div className="grid2">
        <label className="field">
          <span>이름</span>
          <input name="name" maxLength={40} value={values.name} onChange={set("name")} />
        </label>
        <label className="field">
          <span>단위</span>
          <input name="unit" maxLength={10} value={values.unit} onChange={set("unit")} />
        </label>
      </div>
      <div className="grid2">
        <label className="field">
          <span>발주처 (선택)</span>
          <input name="supplierName" maxLength={40} value={values.supplierName} onChange={set("supplierName")} />
        </label>
        <label className="field">
          <span>아이콘</span>
          <select name="icon" value={values.icon} onChange={set("icon")}>
            {ICONS.map((icon) => (
              <option key={icon.value} value={icon.value}>
                {icon.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid2">
        {number("currentStock", "현재 재고", item ? "바꾸면 재고 보정 기록이 남습니다" : undefined)}
        {number("maxStorage", "최대 보관량")}
      </div>
      <div className="grid2">
        {number("reorderPoint", "발주 알림 기준")}
        {number("urgentPoint", "긴급 알림 기준")}
      </div>
      <div className="grid2">
        {number("dailyUsage", "하루 사용량 (선택)", "비워 두면 최근 기록으로 계산합니다")}
        {number("leadTimeDays", "입고까지 걸리는 일수")}
      </div>
      {number("safetyStock", "안전재고 (선택)", "추천 발주점 계산에만 씁니다")}
      <p className="hint">
        {recommended === null ? (
          "하루 사용량과 입고 일수가 있으면 추천 발주점을 참고로 보여드려요."
        ) : (
          <>
            추천 발주점 <strong>{formatNumber(recommended)}</strong> (참고용, 자동 적용되지 않습니다)
          </>
        )}
      </p>
      <p className="error" role="alert">
        {error}
      </p>
      <button className="btn btn-blue" disabled={busy}>
        저장
      </button>
    </form>
  );
}
