import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
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

let state: AuthState = isFirebaseConfigured ? LOADING : LOCAL;
const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (isFirebaseConfigured && !stop) {
    stop = onAuthStateChanged(getAuth(firebaseApp()), (user) => {
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
  await signInWithEmailAndPassword(getAuth(firebaseApp()), email, password);
}

export async function logout() {
  await signOut(getAuth(firebaseApp()));
}
