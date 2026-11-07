# 발주 알림 (1차)

재고와 사용 속도를 보고 발주 시점을 보여주는 웹앱입니다. 기획 문서는 상위 폴더의 `docs/`에 있습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. Firebase 값을 넣지 않으면 **로컬 저장 모드**로 실행되고, 입력한 내용은 그 브라우저에만 저장됩니다.

## 확인

```bash
npm test
npm run lint
npm run build
```

## Firebase 연결

1. Firebase 콘솔에서 프로젝트를 만들고 웹 앱을 추가합니다.
2. Authentication에서 **이메일/비밀번호** 로그인을 켜고, Users 탭에서 대표 계정을 직접 만듭니다. 앱에는 회원가입 화면이 없습니다.
3. Firestore Database를 만듭니다.
4. `.env.example`을 `.env.local`로 복사하고 웹 앱 설정 값을 넣습니다.
5. 보안 규칙과 인덱스를 올립니다.

```bash
npx firebase-tools login
```

```bash
npx firebase-tools deploy --only firestore --project <프로젝트-ID>
```

로컬 저장 모드에서 입력한 데이터는 Firebase로 자동으로 옮겨지지 않습니다.

## 1차 범위

- 포함: 로그인, 품목 등록·수정·삭제, 사용·입고 입력, 재고 보정, 상태 표시, 소진 예상일, 활동 기록
- 2차: 이메일 알림, 발주 완료, 입고 대기, 입고 처리, 발주 기록, 설정, 알림 기록

## 기획 문서와 다르게 둔 부분

- 주의 상태는 발주 기준의 1.5배 이하로 임시로 정했습니다 (`src/lib/inventory.ts`).
- 품목 상태는 저장하지 않고 재고에서 매번 계산합니다.
- 발주처는 별도 관리 화면이 없어 품목에 이름만 적습니다.
- 재고 보정은 품목 수정에서 현재 재고를 바꾸면 기록됩니다.
- 하루 사용량을 비워 두면 최근 14일 사용 기록의 평균을 씁니다.
