"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/AuthCard";
import { signUp } from "@/lib/auth";
import { authErrorMessage, MIN_PASSWORD_LENGTH, validateEmail, validateNewPassword } from "@/lib/authErrors";

export default function SignUpPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email")).trim();
    const password = String(values.get("password"));
    const invalid = validateEmail(email) ?? validateNewPassword(password, String(values.get("confirm")));
    if (invalid) return setError(invalid);

    setBusy(true);
    setError("");
    try {
      await signUp(email, password);
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="회원가입" footer={<Link href="/login">이미 계정이 있으신가요? 로그인</Link>}>
      <form className="form" onSubmit={submit} noValidate>
        <label className="field">
          <span>이메일 (아이디)</span>
          <input name="email" type="email" autoComplete="username" />
        </label>
        <label className="field">
          <span>비밀번호</span>
          <input name="password" type="password" autoComplete="new-password" />
          <small>{MIN_PASSWORD_LENGTH}자 이상</small>
        </label>
        <label className="field">
          <span>비밀번호 확인</span>
          <input name="confirm" type="password" autoComplete="new-password" />
        </label>
        <p className="error" role="alert">
          {error}
        </p>
        <button className="btn btn-blue" disabled={busy}>
          가입하기
        </button>
      </form>
    </AuthCard>
  );
}
