import { describe, expect, it } from "vitest";
import { authErrorMessage, validateEmail, validateNewPassword } from "./authErrors";

describe("authErrorMessage", () => {
  it("Firebase 오류 코드를 한국어로 바꾼다", () => {
    expect(authErrorMessage({ code: "auth/email-already-in-use" })).toContain("이미 가입된");
    expect(authErrorMessage({ code: "auth/invalid-credential" })).toContain("비밀번호를 확인");
  });
  it("모르는 오류는 공통 문구로 보여준다", () => {
    expect(authErrorMessage({ code: "auth/unknown" })).toBe("잠시 후 다시 시도해 주세요.");
    expect(authErrorMessage(new Error("boom"))).toBe("잠시 후 다시 시도해 주세요.");
    expect(authErrorMessage(null)).toBe("잠시 후 다시 시도해 주세요.");
  });
});

describe("validateEmail", () => {
  it("형식이 맞으면 통과", () => expect(validateEmail("a@b.co")).toBeNull());
  it("형식이 틀리면 막는다", () => {
    expect(validateEmail("ab.co")).not.toBeNull();
    expect(validateEmail("a@b")).not.toBeNull();
  });
});

describe("validateNewPassword", () => {
  it("8자 미만은 막는다", () => expect(validateNewPassword("1234567", "1234567")).toContain("8자"));
  it("확인이 다르면 막는다", () => expect(validateNewPassword("12345678", "12345679")).toContain("일치"));
  it("조건을 맞추면 통과", () => expect(validateNewPassword("12345678", "12345678")).toBeNull());
});
