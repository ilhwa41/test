"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/AuthCard";
import { sendPasswordReset } from "@/lib/auth";
import { authErrorMessage, validateEmail } from "@/lib/authErrors";

export default function ResetPasswordPage() {
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    const invalid = validateEmail(email);
    if (invalid) return setError(invalid);

    setBusy(true);
    setError("");
    try {
      await sendPasswordReset(email);
      setSentTo(email);
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="비밀번호 찾기" footer={<Link href="/login">로그인으로 돌아가기</Link>}>
      {sentTo ? (
        <p className="hint">
          가입된 이메일이면 <strong>{sentTo}</strong>로 재설정 메일을 보냈어요. 메일의 링크에서 새 비밀번호를 정한 뒤
          로그인해 주세요. 메일이 안 보이면 스팸함도 확인해 주세요.
        </p>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <label className="field">
            <span>가입한 이메일</span>
            <input name="email" type="email" autoComplete="username" />
          </label>
          <p className="error" role="alert">
            {error}
          </p>
          <button className="btn btn-blue" disabled={busy}>
            재설정 메일 받기
          </button>
        </form>
      )}
    </AuthCard>
  );
}
