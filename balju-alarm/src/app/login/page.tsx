"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { login, useAuth } from "@/lib/auth";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (auth.status === "signedIn" || auth.status === "local") router.replace("/");
  }, [auth.status, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await login(String(values.get("email")).trim(), String(values.get("password")));
    } catch {
      setError("이메일 또는 비밀번호를 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center">
      <form className="card form login" onSubmit={submit}>
        <div className="brand">
          <Icon name="logo" />
          발주 알림
        </div>
        <label className="field">
          <span>이메일</span>
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="field">
          <span>비밀번호</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <p className="error" role="alert">
          {error}
        </p>
        <button className="btn btn-blue" disabled={busy}>
          로그인
        </button>
      </form>
    </div>
  );
}
