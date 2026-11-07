import type { Item, ItemInput, Status, StockLog, StockLogType } from "./types";

/** 문서에 숫자가 없어 임시로 정한 값: 발주 기준의 1.5배 이하이면 주의 */
export const WARNING_RATIO = 1.5;
/** 하루 사용량을 직접 넣지 않았을 때 평균을 내는 기간 */
export const USAGE_WINDOW_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export const STATUS_LABEL: Record<Status, string> = {
  normal: "정상",
  warning: "주의",
  reorder: "발주 필요",
  urgent: "긴급",
};

export class StockError extends Error {}

export function statusOf(item: Pick<Item, "currentStock" | "reorderPoint" | "urgentPoint">): Status {
  if (item.currentStock <= item.urgentPoint) return "urgent";
  if (item.currentStock <= item.reorderPoint) return "reorder";
  if (item.currentStock <= item.reorderPoint * WARNING_RATIO) return "warning";
  return "normal";
}

export function applyStockChange(current: number, type: StockLogType, quantity: number): number {
  const next = type === "in" ? current + quantity : type === "out" ? current - quantity : current + quantity;
  if (next < 0) throw new StockError(`남은 수량(${current.toLocaleString("ko-KR")})보다 많이 입력했어요.`);
  return next;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** 최근 기록의 하루 평균 사용량. 기록을 시작한 날부터 오늘까지로 나누고, 최대 14일만 본다. */
export function averageDailyUsage(logs: StockLog[], itemId: string, now: Date): number | null {
  const today = startOfDay(now);
  const windowStart = today - (USAGE_WINDOW_DAYS - 1) * DAY_MS;
  const used = logs.filter(
    (log) => log.itemId === itemId && log.type === "out" && startOfDay(log.occurredAt) >= windowStart,
  );
  if (!used.length) return null;
  const first = Math.min(...used.map((log) => startOfDay(log.occurredAt)));
  const days = Math.round((today - first) / DAY_MS) + 1;
  return used.reduce((sum, log) => sum + log.quantity, 0) / Math.max(days, 1);
}

export function effectiveDailyUsage(item: Item, logs: StockLog[], now: Date): number | null {
  if (item.dailyUsage && item.dailyUsage > 0) return item.dailyUsage;
  return averageDailyUsage(logs, item.id, now);
}

export function daysLeft(stock: number, dailyUsage: number | null): number | null {
  if (!dailyUsage || dailyUsage <= 0) return null;
  return Math.floor(stock / dailyUsage);
}

export function recommendedReorderPoint(
  dailyUsage: number | null,
  leadTimeDays: number,
  safetyStock: number,
): number | null {
  if (!dailyUsage || dailyUsage <= 0 || leadTimeDays <= 0) return null;
  return Math.ceil(dailyUsage * leadTimeDays + safetyStock);
}

export type ItemView = { item: Item; status: Status; dailyUsage: number | null; days: number | null };

export function toItemViews(items: Item[], logs: StockLog[], now: Date): ItemView[] {
  return items
    .map((item) => {
      const dailyUsage = effectiveDailyUsage(item, logs, now);
      return { item, status: statusOf(item), dailyUsage, days: daysLeft(item.currentStock, dailyUsage) };
    })
    .sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity) || a.item.currentStock - b.item.currentStock);
}

export function needsAttention(view: ItemView): boolean {
  return view.status !== "normal";
}

export type Banner = { tone: "empty" | "danger" | "warning" | "ok"; title: string; subtitle: string };

export function bannerOf(views: ItemView[]): Banner {
  if (!views.length) return { tone: "empty", title: "품목을 추가해서 시작해 보세요", subtitle: "" };
  const need = views.filter((v) => v.status === "reorder" || v.status === "urgent").length;
  const warn = views.filter((v) => v.status === "warning").length;
  if (need) return { tone: "danger", title: `발주가 필요한 품목이 ${need}개 있어요`, subtitle: "" };
  if (warn) return { tone: "warning", title: `곧 발주할 품목이 ${warn}개 있어요`, subtitle: "" };
  return {
    tone: "ok",
    title: "오늘도 수고 많으세요!",
    subtitle: `현재 ${views.length}개 품목이 정상적으로 관리되고 있습니다.`,
  };
}

export function stockBar(item: Pick<Item, "currentStock" | "reorderPoint" | "maxStorage">) {
  const percent = (value: number) => Math.min(100, Math.max(0, (value / item.maxStorage) * 100));
  return { fill: percent(item.currentStock), tick: percent(item.reorderPoint) };
}

export function validateItem(input: ItemInput): string | null {
  if (!input.name.trim()) return "품목 이름을 입력해 주세요.";
  if (input.maxStorage <= 0) return "최대 보관량을 입력해 주세요.";
  if (input.reorderPoint <= 0) return "발주 알림 기준을 입력해 주세요.";
  if (input.urgentPoint < 0 || input.currentStock < 0 || input.safetyStock < 0 || input.leadTimeDays < 0) {
    return "수량은 0 이상으로 입력해 주세요.";
  }
  if (input.dailyUsage !== null && input.dailyUsage < 0) return "하루 사용량은 0 이상으로 입력해 주세요.";
  if (input.urgentPoint > input.reorderPoint) return "긴급 기준은 발주 기준보다 클 수 없어요.";
  return null;
}
