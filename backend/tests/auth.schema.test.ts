import { loginSchema, signupSchema } from "../src/schemas/auth.schema";

const valid = { name: "Jai Agrawal", email: "  Jai@Example.COM ", password: "password123", role: "creator" };

describe("signupSchema", () => {
  it("normalises the email", () => {
    expect(signupSchema.parse(valid).email).toBe("jai@example.com");
  });

  it.each([
    ["short password", { ...valid, password: "short" }],
    ["unknown role", { ...valid, role: "admin" }],
    ["bad email", { ...valid, email: "not-an-email" }],
    ["short name", { ...valid, name: "J" }],
    ["password over 72 chars", { ...valid, password: "a".repeat(73) }],
  ])("rejects %s", (_label, input) => {
    expect(signupSchema.safeParse(input).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});