"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Icon } from "./Icon";

/** 로그인·가입·비밀번호 찾기 화면의 공통 틀. 이미 로그인했으면 대시보드로 보낸다. */
export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "signedIn" || auth.status === "local") router.replace("/");
  }, [auth.status, router]);

  return (
    <div className="center">
      <div className="card login">
        <div className="brand">
          <Icon name="logo" />
          발주 알림
        </div>
        <h1 className="auth-title">{title}</h1>
        {children}
        <div className="auth-links">{footer}</div>
      </div>
    </div>
  );
}
