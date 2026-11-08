"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/AuthCard";
import { login } from "@/lib/auth";
import { authErrorMessage } from "@/lib/authErrors";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await login(String(values.get("email")).trim(), String(values.get("password")));
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="로그인"
      footer={
        <>
          <Link href="/signup">처음이신가요? 회원가입</Link>
          <Link href="/reset-password">비밀번호를 잊으셨나요?</Link>
        </>
      }
    >
      <form className="form" onSubmit={submit}>
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
    </AuthCard>
  );
}
