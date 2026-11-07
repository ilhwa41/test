/** 파이어베이스 오류는 영어라서 화면에는 공통 문구로 보여준다. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.name !== "FirebaseError") return error.message;
  return "저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.";
}
