export const MIN_PASSWORD_LENGTH = 8;

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "이메일 또는 비밀번호를 확인해 주세요.",
  "auth/invalid-login-credentials": "이메일 또는 비밀번호를 확인해 주세요.",
  "auth/wrong-password": "비밀번호를 확인해 주세요.",
  "auth/user-not-found": "이메일 또는 비밀번호를 확인해 주세요.",
  "auth/email-already-in-use": "이미 가입된 이메일이에요. 로그인하거나 비밀번호를 찾아 주세요.",
  "auth/invalid-email": "이메일 형식을 확인해 주세요.",
  "auth/missing-email": "이메일을 입력해 주세요.",
  "auth/weak-password": `비밀번호가 너무 약해요. ${MIN_PASSWORD_LENGTH}자 이상으로 정해 주세요.`,
  "auth/password-does-not-meet-requirements": "비밀번호 조건에 맞지 않아요. 더 길고 복잡하게 정해 주세요.",
  "auth/too-many-requests": "시도가 너무 많아요. 잠시 후 다시 시도해 주세요.",
  "auth/network-request-failed": "인터넷 연결을 확인해 주세요.",
  "auth/operation-not-allowed": "지금은 가입을 받을 수 없어요. 관리자에게 문의해 주세요.",
  "auth/admin-restricted-operation": "지금은 가입을 받을 수 없어요. 관리자에게 문의해 주세요.",
  "auth/user-disabled": "사용이 중지된 계정이에요. 관리자에게 문의해 주세요.",
};

/** Firebase 인증 오류를 화면에 보여줄 한국어 문구로 바꾼다. */
export function authErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  return MESSAGES[code] ?? "잠시 후 다시 시도해 주세요.";
}

export function validateEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : "이메일 형식을 확인해 주세요.";
}

export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 정해 주세요.`;
  if (password !== confirm) return "비밀번호 확인이 일치하지 않아요.";
  return null;
}
