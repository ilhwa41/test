"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, type ReactNode } from "react";
import { logout, useAuth, type AuthState } from "@/lib/auth";
import { formatToday } from "@/lib/format";
import { createFirestoreStore } from "@/lib/store/firestore";
import { createLocalStore } from "@/lib/store/local";
import { StoreProvider, useData, useNow } from "./data";
import { Icon, type IconName } from "./Icon";
import { ToastProvider } from "./toast";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "대시보드", icon: "home" },
  { href: "/input", label: "입력하기", icon: "pen" },
];

function Brand() {
  return (
    <Link className="brand" href="/">
      <Icon name="logo" />
      발주 알림
    </Link>
  );
}

function Nav() {
  const pathname = usePathname();
  const activeHref = pathname.startsWith("/input") ? "/input" : "/";
  return (
    <nav className="nav" aria-label="메뉴">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={item.href === activeHref ? "on" : undefined}
          aria-current={item.href === activeHref ? "page" : undefined}
        >
          <Icon name={item.icon} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Frame({ auth, children }: { auth: AuthState; children: ReactNode }) {
  const now = useNow();
  const data = useData();

  return (
    <div className="app">
      <aside className="sidebar">
        <Brand />
        <Suspense>
          <Nav />
        </Suspense>
      </aside>
      <div className="main">
        <header className="topbar">
          <Brand />
          {now.getTime() > 0 && <span className="date">오늘 {formatToday(now)}</span>}
          {auth.status === "signedIn" ? (
            <details className="user-menu">
              <summary>내 계정</summary>
              <div className="menu" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>
                <span className="menu-email">{auth.email}</span>
                <Link href="/account">비밀번호 변경</Link>
                <button type="button" onClick={() => void logout()}>
                  로그아웃
                </button>
              </div>
            </details>
          ) : (
            <span className="user">대표님</span>
          )}
        </header>
        {auth.status === "local" && (
          <p className="mode-note">로컬 저장 모드: 입력한 내용은 이 브라우저에만 저장됩니다.</p>
        )}
        <main className="content">
          {children}
          {data.status === "loading" && <p className="empty">불러오는 중이에요</p>}
          {data.status === "error" && <p className="card empty">{data.message}</p>}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const ownerId = auth.status === "signedIn" ? auth.uid : null;
  const isLocal = auth.status === "local";

  useEffect(() => {
    if (auth.status === "signedOut") router.replace("/login");
  }, [auth.status, router]);

  const store = useMemo(() => {
    if (isLocal) return createLocalStore(window.localStorage);
    return ownerId ? createFirestoreStore(ownerId) : null;
  }, [isLocal, ownerId]);

  return (
    <StoreProvider value={store}>
      <ToastProvider>
        <Frame auth={auth}>{children}</Frame>
      </ToastProvider>
    </StoreProvider>
  );
}
