# 05. 배포 구조와 환경설정

> 발주 타이밍 알림 시스템 기획 문서 · 2026-11-07 · 근거: 프로젝트 회의(바이브코딩 팀)

## 배포 구조

### 역할 분담
| 서비스 | 맡는 일 |
|---|---|
| **Vercel** | 웹앱 호스팅, 서버 API, 정해진 시각에 재고를 점검하는 예약 작업(Cron) |
| **Firebase** | 로그인(Authentication), 데이터 저장(Firestore) |
| **이메일 발송 서비스** (예: Resend) | 발주 알림 메일 발송. 서비스는 확정 전이며 교체 가능 |

흐름: 매일 정해진 시각에 Vercel Cron이 서버 API를 호출 → Firestore에서 품목을 읽어 발주점과 비교 → 해당 품목이 있으면 이메일 발송 → `alerts`에 기록.

Cron 실행 횟수와 주기는 Vercel 요금제에 따라 제한이 있을 수 있으니 배포 전에 확인한다.

### 필요한 환경변수 이름 (값은 적지 않음)
| 이름 | 용도 | 노출 |
|---|---|---|
| NEXT_PUBLIC_FIREBASE_API_KEY | Firebase 웹 설정 | 브라우저 노출 |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | 〃 | 브라우저 노출 |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | 〃 | 브라우저 노출 |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | 〃 | 브라우저 노출 |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | 〃 | 브라우저 노출 |
| NEXT_PUBLIC_FIREBASE_APP_ID | 〃 | 브라우저 노출 |
| FIREBASE_ADMIN_PROJECT_ID | 서버에서 Firestore 접근 | 서버 전용 |
| FIREBASE_ADMIN_CLIENT_EMAIL | 〃 | 서버 전용 |
| FIREBASE_ADMIN_PRIVATE_KEY | 〃 | 서버 전용 |
| EMAIL_API_KEY | 이메일 발송 서비스 키 | 서버 전용 |
| NOTIFY_FROM_EMAIL | 보내는 이메일 주소 | 서버 전용 |
| CRON_SECRET | Cron 호출이 맞는지 확인하는 비밀값 | 서버 전용 |

### 환경변수 주의
- 위 이름들은 **내 컴퓨터의 `.env.local`과 Vercel 환경변수에 똑같이** 넣어야 한다. 한쪽에만 넣으면 로컬에서는 되는데 배포하면 안 되는 문제가 생긴다.
- `NEXT_PUBLIC_`으로 시작하는 값은 브라우저에 공개된다. 서버 전용 키에는 이 접두사를 붙이지 않는다.
- 비밀 키는 채팅이나 문서에 적지 않고, `.env.local`을 Git에 올리지 않는다.

## 환경설정

로컬에서 실행해 보기까지의 순서입니다. (웹 프레임워크는 Vercel과 잘 맞는 Next.js를 가정했습니다.)

### 1) 설치와 계정
1. Node.js (LTS 버전) 설치
2. Git 설치, GitHub 계정 만들기
3. Vercel 계정 만들기 (GitHub 계정으로 가입하면 편함)
4. Firebase 콘솔에서 새 프로젝트 만들기 (구글 계정 필요)
5. 이메일 발송 서비스 계정 만들기 (선택한 서비스 기준)

### 2) CLI 설치와 로그인

```bash
npm install -g vercel firebase-tools

vercel login
firebase login
```

### 3) 프로젝트 만들고 연결

```bash
npx create-next-app@latest balju-alarm
cd balju-alarm

vercel link                 # Vercel 프로젝트와 연결
firebase init firestore     # Firestore 규칙·인덱스 파일 생성
```

### 4) 환경변수 넣고 실행
1. 위 "필요한 환경변수 이름" 목록의 이름들로 `.env.local` 파일을 만든다. 값은 Firebase 콘솔과 이메일 서비스에서 복사한다.
2. 같은 이름과 값을 Vercel 프로젝트의 환경변수에도 등록한다. (`vercel env add`로 하나씩 넣거나, Vercel 화면에서 입력)
3. 실행:

```bash
npm install
npm run dev
```

4. 브라우저에서 `http://localhost:3000`이 열리면 성공.

### 5) 배포

```bash
vercel --prod
```
