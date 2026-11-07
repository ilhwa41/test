import type { Item, ItemInput, StockEntry, StockLog } from "../types";

export type DataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: Item[]; logs: StockLog[] };

export type DataStore = {
  subscribe(listener: () => void): () => void;
  getState(): DataState;
  /** id가 있으면 수정. 재고가 바뀌면 보정 기록을 함께 남긴다. 저장한 품목 id를 돌려준다. */
  saveItem(input: ItemInput, id?: string): Promise<string>;
  deleteItem(id: string): Promise<void>;
  recordStock(entry: StockEntry): Promise<void>;
};
