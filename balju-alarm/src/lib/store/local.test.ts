import { beforeEach, describe, expect, it } from "vitest";
import type { ItemInput } from "../types";
import { createLocalStore, LOCAL_STORAGE_KEY } from "./local";
import type { DataStore } from "./types";

const yarn: ItemInput = {
  name: "원사", unit: "개", icon: "yarn", supplierName: "", currentStock: 380, dailyUsage: 100,
  leadTimeDays: 21, safetyStock: 100, reorderPoint: 400, urgentPoint: 200, maxStorage: 1000,
};

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const ready = (store: DataStore) => {
  const state = store.getState();
  if (state.status !== "ready") throw new Error(state.status);
  return state;
};

describe("createLocalStore", () => {
  let storage: ReturnType<typeof memoryStorage>;
  let store: DataStore;
  beforeEach(() => {
    storage = memoryStorage();
    store = createLocalStore(storage);
  });

  it("사용과 입고를 재고와 기록에 함께 반영한다", async () => {
    const itemId = await store.saveItem(yarn);
    await store.recordStock({ itemId, type: "out", quantity: 180, memo: "", occurredAt: new Date() });
    await store.recordStock({ itemId, type: "in", quantity: 1000, memo: "", occurredAt: new Date() });
    const { items, logs } = ready(store);
    expect(items[0].currentStock).toBe(1200);
    expect(logs).toHaveLength(2);
  });

  it("재고보다 많이 쓰면 재고도 기록도 바뀌지 않는다", async () => {
    const itemId = await store.saveItem(yarn);
    await expect(
      store.recordStock({ itemId, type: "out", quantity: 381, memo: "", occurredAt: new Date() }),
    ).rejects.toThrow("남은 수량");
    const { items, logs } = ready(store);
    expect(items[0].currentStock).toBe(380);
    expect(logs).toHaveLength(0);
  });

  it("품목 수정으로 재고가 바뀌면 보정 기록을 남긴다", async () => {
    const id = await store.saveItem(yarn);
    await store.saveItem({ ...yarn, currentStock: 350 }, id);
    await store.saveItem({ ...yarn, currentStock: 350, name: "원사A" }, id);
    const { items, logs } = ready(store);
    expect(items[0].name).toBe("원사A");
    expect(logs.map((log) => [log.type, log.quantity])).toEqual([["adjust", -30]]);
  });

  it("다시 열어도 날짜까지 그대로 복원한다", async () => {
    const itemId = await store.saveItem(yarn);
    await store.recordStock({ itemId, type: "out", quantity: 1, memo: "메모", occurredAt: new Date(2026, 10, 7) });
    const { items, logs } = ready(createLocalStore(storage));
    expect(items[0].createdAt).toBeInstanceOf(Date);
    expect(logs[0].occurredAt.getDate()).toBe(7);
    expect(logs[0].memo).toBe("메모");
  });

  it("품목을 지워도 기록은 남긴다", async () => {
    const itemId = await store.saveItem(yarn);
    await store.recordStock({ itemId, type: "out", quantity: 1, memo: "", occurredAt: new Date() });
    await store.deleteItem(itemId);
    const { items, logs } = ready(store);
    expect(items).toHaveLength(0);
    expect(logs).toHaveLength(1);
  });

  it("저장된 값이 깨져 있으면 덮어쓰지 않고 오류로 알린다", () => {
    storage.setItem(LOCAL_STORAGE_KEY, "{broken");
    expect(createLocalStore(storage).getState().status).toBe("error");
    expect(storage.getItem(LOCAL_STORAGE_KEY)).toBe("{broken");
  });
});
