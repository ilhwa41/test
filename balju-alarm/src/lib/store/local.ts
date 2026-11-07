import { applyStockChange } from "../inventory";
import type { Item, ItemInput, StockEntry, StockLog } from "../types";
import type { DataState, DataStore } from "./types";

export const LOCAL_STORAGE_KEY = "balju-alarm:v1";

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;
type Saved = { items: Item[]; logs: StockLog[] };

function parse(raw: string | null): Saved {
  if (!raw) return { items: [], logs: [] };
  const saved = JSON.parse(raw) as Saved;
  return {
    items: saved.items.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    logs: saved.logs.map((log) => ({
      ...log,
      occurredAt: new Date(log.occurredAt),
      createdAt: new Date(log.createdAt),
    })),
  };
}

const byNewest = (a: StockLog, b: StockLog) =>
  b.occurredAt.getTime() - a.occurredAt.getTime() || b.createdAt.getTime() - a.createdAt.getTime();

/** Firebase 설정 전에 쓰는 저장소. 데이터는 이 브라우저에만 남는다. */
export function createLocalStore(storage: Storage, newId: () => string = () => crypto.randomUUID()): DataStore {
  const listeners = new Set<() => void>();
  let saved: Saved;
  let state: DataState;

  try {
    saved = parse(storage.getItem(LOCAL_STORAGE_KEY));
    state = { status: "ready", ...saved };
  } catch {
    saved = { items: [], logs: [] };
    state = { status: "error", message: "저장된 데이터를 읽지 못했어요." };
  }

  function commit(next: Saved) {
    storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    saved = { items: next.items, logs: [...next.logs].sort(byNewest) };
    state = { status: "ready", ...saved };
    listeners.forEach((notify) => notify());
  }

  /* 다른 탭에서 저장한 내용을 덮어쓰지 않도록 바로 다시 읽는다. */
  function onOtherTab(event: StorageEvent) {
    if (event.key !== LOCAL_STORAGE_KEY) return;
    try {
      saved = parse(event.newValue);
      state = { status: "ready", ...saved };
    } catch {
      state = { status: "error", message: "저장된 데이터를 읽지 못했어요." };
    }
    listeners.forEach((notify) => notify());
  }

  function log(entry: Omit<StockLog, "id" | "createdAt">, now: Date): StockLog {
    return { ...entry, id: newId(), createdAt: now };
  }

  return {
    subscribe(listener) {
      if (!listeners.size && typeof window !== "undefined") window.addEventListener("storage", onOtherTab);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size && typeof window !== "undefined") window.removeEventListener("storage", onOtherTab);
      };
    },
    getState: () => state,
    async saveItem(input: ItemInput, id?: string) {
      const now = new Date();
      if (!id) {
        const item: Item = { ...input, id: newId(), createdAt: now, updatedAt: now };
        commit({ items: [...saved.items, item], logs: saved.logs });
        return item.id;
      }
      const current = saved.items.find((item) => item.id === id);
      if (!current) throw new Error("품목을 찾을 수 없어요.");
      const delta = input.currentStock - current.currentStock;
      const logs = delta
        ? [log({ itemId: id, type: "adjust", quantity: delta, memo: "", occurredAt: now }, now), ...saved.logs]
        : saved.logs;
      commit({
        items: saved.items.map((item) => (item.id === id ? { ...item, ...input, updatedAt: now } : item)),
        logs,
      });
      return id;
    },
    async deleteItem(id) {
      commit({ items: saved.items.filter((item) => item.id !== id), logs: saved.logs });
    },
    async recordStock(entry: StockEntry) {
      const now = new Date();
      const current = saved.items.find((item) => item.id === entry.itemId);
      if (!current) throw new Error("품목을 찾을 수 없어요.");
      const currentStock = applyStockChange(current.currentStock, entry.type, entry.quantity);
      commit({
        items: saved.items.map((item) => (item.id === entry.itemId ? { ...item, currentStock, updatedAt: now } : item)),
        logs: [log(entry, now), ...saved.logs],
      });
    },
  };
}
