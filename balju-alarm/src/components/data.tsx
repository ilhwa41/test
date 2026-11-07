"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { DataState, DataStore } from "@/lib/store/types";

/* 로그인 확인이 끝나기 전과 서버 렌더링 때는 저장소가 없다. */
const StoreContext = createContext<DataStore | null>(null);
export const StoreProvider = StoreContext.Provider;

const LOADING: DataState = { status: "loading" };
const readLoading = () => LOADING;
const subscribeNothing = () => () => {};

export function useStore(): DataStore | null {
  return useContext(StoreContext);
}

export function useData(): DataState {
  const store = useStore();
  const read = store?.getState ?? readLoading;
  return useSyncExternalStore(store?.subscribe ?? subscribeNothing, read, read);
}

/* 오래 열어 둔 화면에서도 날짜와 D-숫자가 맞도록 1분마다 갱신한다. */
const MINUTE = 60_000;
let now: Date | null = null;
const clockListeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  timer ??= setInterval(() => {
    now = new Date();
    clockListeners.forEach((notify) => notify());
  }, MINUTE);
  return () => {
    clockListeners.delete(listener);
    if (!clockListeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function readClock() {
  now ??= new Date();
  return now;
}

/** 서버에서는 현재 시각을 쓰지 않는다. 화면은 브라우저에서 시각을 읽은 뒤에 그린다. */
const SERVER_TIME = new Date(0);

export function useNow(): Date {
  return useSyncExternalStore(subscribeClock, readClock, () => SERVER_TIME);
}
