const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

export const formatNumber = (n: number) => n.toLocaleString("ko-KR");
export const formatDate = (d: Date) => `${pad(d.getMonth() + 1)}.${pad(d.getDate())} (${DAYS[d.getDay()]})`;
export const formatDateTime = (d: Date) => `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const formatToday = (d: Date) => `${d.getFullYear()}.${formatDate(d)}`;
export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 날짜 입력값에 지금 시각을 붙인다. 오늘보다 뒤의 날짜면 null. */
export function occurredAtFrom(dateInput: string, now: Date): Date | null {
  const [year, month, day] = dateInput.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, now.getHours(), now.getMinutes());
  return toDateInput(date) > toDateInput(now) ? null : date;
}
