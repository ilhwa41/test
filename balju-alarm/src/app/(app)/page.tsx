"use client";

import Link from "next/link";
import { useData, useNow } from "@/components/data";
import { Icon, type IconName } from "@/components/Icon";
import { ItemCard } from "@/components/ItemCard";
import { LogList } from "@/components/LogList";
import { bannerOf, needsAttention, toItemViews, type Banner } from "@/lib/inventory";

const BANNER_ICON: Record<Banner["tone"], IconName> = { empty: "plus", danger: "alert", warning: "alert", ok: "check" };
const TONE_CLASS: Record<Banner["tone"], string> = {
  empty: "tone-empty",
  danger: "tone-danger",
  warning: "tone-warning",
  ok: "tone-ok",
};

export default function DashboardPage() {
  const data = useData();
  const now = useNow();
  if (data.status !== "ready") return null;

  const views = toItemViews(data.items, data.logs, now);
  const attention = views.filter(needsAttention);
  const banner = bannerOf(views);

  return (
    <>
      <section className="banner">
        <span className={`banner-icon ${TONE_CLASS[banner.tone]}`}>
          <Icon name={BANNER_ICON[banner.tone]} />
        </span>
        <div>
          <h1>{banner.title}</h1>
          {banner.subtitle && <p>{banner.subtitle}</p>}
        </div>
      </section>
      <div className="quick">
        <Link className="btn btn-blue" href="/input?tab=use">
          <Icon name="pen" />
          사용 입력
        </Link>
        <Link className="btn btn-green" href="/input?tab=in">
          <Icon name="box" />
          입고 입력
        </Link>
        <Link className="btn btn-white" href="/items/new">
          품목 추가 <Icon name="plus" />
        </Link>
      </div>
      <div className="cols">
        <section>
          <div className="sec-head">
            <h2>알림이 필요한 품목</h2>
            <Link className="more" href="/items">
              전체 보기 ›
            </Link>
          </div>
          <div className="stack">
            {attention.map((view) => (
              <ItemCard key={view.item.id} view={view} />
            ))}
            {!attention.length && <p className="card empty">지금은 알림이 필요한 품목이 없어요</p>}
          </div>
        </section>
        <section>
          <div className="sec-head">
            <h2>최근 활동 내역</h2>
            <Link className="more" href="/activity">
              전체 보기 ›
            </Link>
          </div>
          <LogList logs={data.logs.slice(0, 3)} items={data.items} />
        </section>
      </div>
    </>
  );
}
