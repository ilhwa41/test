import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import { applyStockChange } from "../inventory";
import type { Item, ItemInput, StockEntry, StockLog } from "../types";
import type { DataState, DataStore } from "./types";

/** 대시보드·활동 기록·평균 사용량 계산에 충분한 범위 */
const LOG_LIMIT = 500;

function toItem(snapshot: QueryDocumentSnapshot<DocumentData>): Item {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    unit: data.unit,
    icon: data.icon,
    supplierName: data.supplierName,
    currentStock: data.currentStock,
    dailyUsage: data.dailyUsage,
    leadTimeDays: data.leadTimeDays,
    safetyStock: data.safetyStock,
    reorderPoint: data.reorderPoint,
    urgentPoint: data.urgentPoint,
    maxStorage: data.maxStorage,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

function toLog(snapshot: QueryDocumentSnapshot<DocumentData>): StockLog {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    itemId: data.itemId,
    type: data.type,
    quantity: data.quantity,
    memo: data.memo,
    occurredAt: data.occurredAt.toDate(),
    createdAt: data.createdAt.toDate(),
  };
}

export function createFirestoreStore(ownerId: string): DataStore {
  const db = getFirestore(firebaseApp());
  const itemsRef = collection(db, "items");
  const logsRef = collection(db, "stockLogs");
  const listeners = new Set<() => void>();

  let state: DataState = { status: "loading" };
  let items: Item[] | null = null;
  let logs: StockLog[] | null = null;
  let stop: (() => void) | null = null;

  function publish(next: DataState) {
    state = next;
    listeners.forEach((notify) => notify());
  }

  function update() {
    if (items && logs) publish({ status: "ready", items, logs });
  }

  function fail() {
    publish({ status: "error", message: "데이터를 불러오지 못했어요. 연결과 Firestore 설정을 확인해 주세요." });
  }

  function start() {
    const stopItems = onSnapshot(
      query(itemsRef, where("ownerId", "==", ownerId)),
      (snapshot) => {
        items = snapshot.docs.map(toItem);
        update();
      },
      fail,
    );
    const stopLogs = onSnapshot(
      query(logsRef, where("ownerId", "==", ownerId), orderBy("occurredAt", "desc"), limit(LOG_LIMIT)),
      (snapshot) => {
        logs = snapshot.docs.map(toLog);
        update();
      },
      fail,
    );
    stop = () => {
      stopItems();
      stopLogs();
    };
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (!stop) start();
      return () => {
        listeners.delete(listener);
        if (!listeners.size && stop) {
          stop();
          stop = null;
        }
      };
    },
    getState: () => state,
    async saveItem(input: ItemInput, id?: string) {
      const now = Timestamp.now();
      if (!id) {
        const ref = doc(itemsRef);
        await runTransaction(db, async (tx) => {
          tx.set(ref, { ...input, ownerId, createdAt: now, updatedAt: now });
        });
        return ref.id;
      }
      const ref = doc(itemsRef, id);
      await runTransaction(db, async (tx) => {
        const current = await tx.get(ref);
        if (!current.exists()) throw new Error("품목을 찾을 수 없어요.");
        const delta = input.currentStock - current.data().currentStock;
        tx.update(ref, { ...input, updatedAt: now });
        if (delta) {
          tx.set(doc(logsRef), {
            itemId: id, type: "adjust", quantity: delta, memo: "", occurredAt: now, ownerId, createdAt: now,
          });
        }
      });
      return id;
    },
    async deleteItem(id) {
      await deleteDoc(doc(itemsRef, id));
    },
    async recordStock(entry: StockEntry) {
      const now = Timestamp.now();
      const ref = doc(itemsRef, entry.itemId);
      await runTransaction(db, async (tx) => {
        const current = await tx.get(ref);
        if (!current.exists()) throw new Error("품목을 찾을 수 없어요.");
        const currentStock = applyStockChange(current.data().currentStock, entry.type, entry.quantity);
        tx.update(ref, { currentStock, updatedAt: now });
        tx.set(doc(logsRef), {
          ...entry,
          occurredAt: Timestamp.fromDate(entry.occurredAt),
          ownerId,
          createdAt: now,
        });
      });
    },
  };
}
