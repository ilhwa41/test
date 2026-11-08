import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { useSyncExternalStore } from "react";
import { firebaseApp, isFirebaseConfigured } from "./firebase";

export type AuthState =
  | { status: "loading" }
  | { status: "local" }
  | { status: "signedOut" }
  | { status: "signedIn"; uid: string; email: string };

const LOADING: AuthState = { status: "loading" };
const LOCAL: AuthState = { status: "local" };
const SIGNED_OUT: AuthState = { status: "signedOut" };

/* 비밀번호 재설정 메일을 한국어로 보낸다. */
function firebaseAuth() {
  const auth = getAuth(firebaseApp());
  auth.languageCode = "ko";
  return auth;
}

let state: AuthState = isFirebaseConfigured ? LOADING : LOCAL;
const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (isFirebaseConfigured && !stop) {
    stop = onAuthStateChanged(firebaseAuth(), (user) => {
      state = user ? { status: "signedIn", uid: user.uid, email: user.email ?? "" } : SIGNED_OUT;
      listeners.forEach((notify) => notify());
    });
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => LOADING);
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(firebaseAuth(), email, password);
}

/** 가입하면 바로 로그인된다. */
export async function signUp(email: string, password: string) {
  await createUserWithEmailAndPassword(firebaseAuth(), email, password);
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(firebaseAuth(), email);
}

/** 현재 비밀번호로 한 번 더 확인한 뒤 바꾼다. */
export async function changePassword(currentPassword: string, newPassword: string) {
  const user = firebaseAuth().currentUser;
  if (!user?.email) throw new Error("로그인이 필요해요.");
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
  await updatePassword(user, newPassword);
}

export async function logout() {
  await signOut(firebaseAuth());
}
