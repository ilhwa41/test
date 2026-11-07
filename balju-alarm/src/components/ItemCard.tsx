import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { STATUS_LABEL, stockBar, type ItemView } from "@/lib/inventory";
import { Icon } from "./Icon";

export function ItemCard({ view, linked = true }: { view: ItemView; linked?: boolean }) {
  const { item, status, days } = view;
  const bar = stockBar(item);
  const hot = status === "reorder" || status === "urgent";
  const body = (
    <>
      <div className="item-icon">
        <Icon name={item.icon} />
      </div>
      <div>
        <div className="item-top">
          <span className="item-name">{item.name}</span>
          <span className="badge">{STATUS_LABEL[status]}</span>
        </div>
        <p className="item-meta">
          {formatNumber(item.currentStock)}
          {item.unit}
          <span className="sep">|</span>
          {days === null ? (
            <span className="dday none">사용 기록 필요</span>
          ) : (
            <span className={hot ? "dday hot" : "dday"}>D-{days}</span>
          )}
        </p>
        <div className="bar">
          <i style={{ width: `${bar.fill}%` }} />
          <b style={{ left: `${bar.tick}%` }} />
        </div>
      </div>
    </>
  );
  const className = `card item s-${status}`;
  return linked ? (
    <Link className={className} href={`/items/${item.id}`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
