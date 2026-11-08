"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "@/components/toast";
import { changePassword, useAuth } from "@/lib/auth";
import { authErrorMessage, MIN_PASSWORD_LENGTH, validateNewPassword } from "@/lib/authErrors";

export default function AccountPage() {
  const auth = useAuth();
  const toast = useToast();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (auth.status !== "signedIn") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const next = String(values.get("password"));
    const invalid = validateNewPassword(next, String(values.get("confirm")));
    if (invalid) return setError(invalid);

    setBusy(true);
    setError("");
    try {
      await changePassword(String(values.get("current")), next);
      form.reset();
      toast("비밀번호를 바꿨어요");
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="page-title">내 계정</h1>
      <div className="stack">
        <section className="card">
          <p className="act-time">로그인 이메일 (아이디)</p>
          <p className="act-title">{auth.email}</p>
        </section>
        <form className="card form" onSubmit={submit} noValidate>
          <h2 className="sec-title">비밀번호 변경</h2>
          <label className="field">
            <span>현재 비밀번호</span>
            <input name="current" type="password" autoComplete="current-password" />
          </label>
          <label className="field">
            <span>새 비밀번호</span>
            <input name="password" type="password" autoComplete="new-password" />
            <small>{MIN_PASSWORD_LENGTH}자 이상</small>
          </label>
          <label className="field">
            <span>새 비밀번호 확인</span>
            <input name="confirm" type="password" autoComplete="new-password" />
          </label>
          <p className="error" role="alert">
            {error}
          </p>
          <button className="btn btn-blue" disabled={busy}>
            비밀번호 바꾸기
          </button>
        </form>
      </div>
    </>
  );
}
