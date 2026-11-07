"use client";

import { useData } from "@/components/data";
import { LogList } from "@/components/LogList";

export default function ActivityPage() {
  const data = useData();
  if (data.status !== "ready") return null;
  return (
    <>
      <h1 className="page-title">활동 기록</h1>
      <LogList logs={data.logs} items={data.items} />
    </>
  );
}
