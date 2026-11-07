export type StockLogType = "in" | "out" | "adjust";

export type ItemIcon = "yarn" | "box" | "tag" | "roll";

export type Item = {
  id: string;
  name: string;
  unit: string;
  icon: ItemIcon;
  supplierName: string;
  currentStock: number;
  /** 직접 입력한 하루 사용량. 없으면 최근 기록으로 계산한다. */
  dailyUsage: number | null;
  leadTimeDays: number;
  safetyStock: number;
  reorderPoint: number;
  urgentPoint: number;
  maxStorage: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ItemInput = Omit<Item, "id" | "createdAt" | "updatedAt">;

export type StockLog = {
  id: string;
  itemId: string;
  type: StockLogType;
  /** in·out은 양수, adjust는 증감량(음수 가능) */
  quantity: number;
  memo: string;
  occurredAt: Date;
  createdAt: Date;
};

export type StockEntry = {
  itemId: string;
  type: "in" | "out";
  quantity: number;
  memo: string;
  occurredAt: Date;
};

export type Status = "normal" | "warning" | "reorder" | "urgent";
