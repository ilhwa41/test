import { getApps, initializeApp, type FirebaseApp } from "firebase/app";

/* 웹 앱 식별값이라 브라우저에 공개되는 값이다. 데이터는 로그인과 firestore.rules로 보호한다.
   NEXT_PUBLIC 값이 있으면 그 값이 우선한다. 빌드 때 글자 그대로 치환되므로 하나씩 적어야 한다. */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCWry1vHQw5Lsw12Di7zFqYu3WD2h4XAnE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "test-1ef99.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "test-1ef99",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "test-1ef99.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "95099240074",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:95099240074:web:dd29d5ba30308b58a6f773",
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

export function firebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(config);
}
