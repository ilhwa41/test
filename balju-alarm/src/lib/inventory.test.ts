import { describe, expect, it } from "vitest";
import {
  applyStockChange,
  averageDailyUsage,
  bannerOf,
  daysLeft,
  effectiveDailyUsage,
  recommendedReorderPoint,
  statusOf,
  stockBar,
  StockError,
  toItemViews,
  validateItem,
} from "./inventory";
import type { Item, StockLog } from "./types";

const now = new Date(2026, 10, 7, 15, 0);
const daysAgo = (n: number) => new Date(2026, 10, 7 - n, 10, 0);

const yarn: Item = {
  id: "yarn", name: "원사", unit: "개", icon: "yarn", supplierName: "", currentStock: 380, dailyUsage: 100,
  leadTimeDays: 21, safetyStock: 100, reorderPoint: 400, urgentPoint: 200, maxStorage: 1000,
  createdAt: now, updatedAt: now,
};
const out = (quantity: number, ago: number, itemId = "yarn"): StockLog => ({
  id: `${itemId}-${ago}-${quantity}`, itemId, type: "out", quantity, memo: "", occurredAt: daysAgo(ago), createdAt: now,
});

describe("statusOf", () => {
  const at = (currentStock: number) => statusOf({ currentStock, reorderPoint: 400, urgentPoint: 200 });
  it("기준 수량과 같으면 해당 단계로 본다", () => {
    expect(at(200)).toBe("urgent");
    expect(at(201)).toBe("reorder");
    expect(at(400)).toBe("reorder");
    expect(at(401)).toBe("warning");
    expect(at(600)).toBe("warning");
    expect(at(601)).toBe("normal");
  });
});

describe("applyStockChange", () => {
  it("입고는 더하고 사용은 뺀다", () => {
    expect(applyStockChange(100, "in", 50)).toBe(150);
    expect(applyStockChange(100, "out", 100)).toBe(0);
  });
  it("보정은 증감량을 반영한다", () => {
    expect(applyStockChange(100, "adjust", -30)).toBe(70);
  });
  it("재고가 음수가 되면 막는다", () => {
    expect(() => applyStockChange(100, "out", 101)).toThrow(StockError);
  });
});

describe("averageDailyUsage", () => {
  it("기록이 없으면 계산하지 않는다", () => {
    expect(averageDailyUsage([], "yarn", now)).toBeNull();
  });
  it("기록을 시작한 날부터 오늘까지로 나눈다", () => {
    expect(averageDailyUsage([out(100, 0), out(200, 2)], "yarn", now)).toBe(100);
  });
  it("14일이 넘은 기록과 다른 품목은 뺀다", () => {
    expect(averageDailyUsage([out(70, 0), out(999, 14), out(999, 0, "pack")], "yarn", now)).toBe(70);
  });
  it("입고와 보정은 사용량에 넣지 않는다", () => {
    const log = { ...out(50, 0), type: "in" as const };
    expect(averageDailyUsage([log], "yarn", now)).toBeNull();
  });
});

describe("effectiveDailyUsage", () => {
  it("직접 입력한 값이 우선한다", () => {
    expect(effectiveDailyUsage(yarn, [out(10, 0)], now)).toBe(100);
  });
  it("입력값이 없으면 기록으로 계산한다", () => {
    expect(effectiveDailyUsage({ ...yarn, dailyUsage: null }, [out(10, 0)], now)).toBe(10);
  });
});

describe("daysLeft", () => {
  it("남은 일수를 내림한다", () => {
    expect(daysLeft(380, 100)).toBe(3);
    expect(daysLeft(0, 100)).toBe(0);
  });
  it("사용량을 모르면 계산하지 않는다", () => {
    expect(daysLeft(380, null)).toBeNull();
    expect(daysLeft(380, 0)).toBeNull();
  });
});

describe("recommendedReorderPoint", () => {
  it("하루 사용량 × 입고 일수 + 안전재고", () => {
    expect(recommendedReorderPoint(100, 21, 100)).toBe(2200);
  });
  it("값이 부족하면 보여주지 않는다", () => {
    expect(recommendedReorderPoint(null, 21, 100)).toBeNull();
    expect(recommendedReorderPoint(100, 0, 100)).toBeNull();
  });
});

describe("toItemViews", () => {
  it("소진이 빠른 순으로 정렬하고 계산이 안 되는 품목은 뒤로 보낸다", () => {
    const soon = { ...yarn, id: "soon", currentStock: 100 };
    const unknown = { ...yarn, id: "unknown", dailyUsage: null };
    const views = toItemViews([unknown, yarn, soon], [], now);
    expect(views.map((v) => v.item.id)).toEqual(["soon", "yarn", "unknown"]);
  });
});

describe("bannerOf", () => {
  const views = (...stocks: number[]) => toItemViews(stocks.map((currentStock, i) => ({ ...yarn, id: `${i}`, currentStock })), [], now);
  it("품목이 없으면 시작 안내", () => expect(bannerOf([]).tone).toBe("empty"));
  it("발주 필요와 긴급을 함께 센다", () => {
    expect(bannerOf(views(100, 300, 900)).title).toBe("발주가 필요한 품목이 2개 있어요");
  });
  it("주의만 있으면 주의 문구", () => {
    expect(bannerOf(views(500, 900)).title).toBe("곧 발주할 품목이 1개 있어요");
  });
  it("모두 정상이면 인사 문구", () => {
    expect(bannerOf(views(900, 900)).subtitle).toContain("2개 품목");
  });
});

describe("stockBar", () => {
  it("최대 보관량 대비 비율이고 100%를 넘지 않는다", () => {
    expect(stockBar(yarn)).toEqual({ fill: 38, tick: 40 });
    expect(stockBar({ ...yarn, currentStock: 1500 }).fill).toBe(100);
  });
});

describe("validateItem", () => {
  const input = { ...yarn };
  it("정상 입력은 통과한다", () => expect(validateItem(input)).toBeNull());
  it("이름은 필수", () => expect(validateItem({ ...input, name: " " })).toContain("이름"));
  it("긴급 기준은 발주 기준 이하", () => {
    expect(validateItem({ ...input, urgentPoint: 500 })).toContain("긴급");
  });
});
