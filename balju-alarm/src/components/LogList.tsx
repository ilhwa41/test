import { formatDateTime, formatNumber } from "@/lib/format";
import type { Item, StockLog } from "@/lib/types";
import { Icon, type IconName } from "./Icon";

const LOOK: Record<StockLog["type"], { className: string; icon: IconName }> = {
  in: { className: "act-in", icon: "check" },
  out: { className: "act-out", icon: "pen" },
  adjust: { className: "act-adjust", icon: "scale" },
};

function describe(log: StockLog, item: Item | undefined) {
  const name = item?.name ?? "삭제된 품목";
  const unit = item?.unit ?? "";
  if (log.type === "adjust") {
    return `${name} 재고 보정 ${log.quantity > 0 ? "+" : ""}${formatNumber(log.quantity)}${unit}`;
  }
  return `${name} ${formatNumber(log.quantity)}${unit} ${log.type === "in" ? "입고" : "사용"}`;
}

export function LogList({ logs, items }: { logs: StockLog[]; items: Item[] }) {
  if (!logs.length) {
    return (
      <div className="card activity">
        <p className="empty">아직 기록이 없어요</p>
      </div>
    );
  }
  return (
    <div className="card activity">
      {logs.map((log) => (
        <div className="act" key={log.id}>
          <span className={`act-icon ${LOOK[log.type].className}`}>
            <Icon name={LOOK[log.type].icon} />
          </span>
          <div>
            <p className="act-title">{describe(log, items.find((item) => item.id === log.itemId))}</p>
            <p className="act-time">
              {formatDateTime(log.occurredAt)}
              {log.memo ? ` · ${log.memo}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
