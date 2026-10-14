import jwt from "jsonwebtoken";
import { signToken, verifyToken } from "../src/utils/jwt";

describe("jwt helpers", () => {
  it("round-trips id and role", () => {
    const token = signToken({ id: "abc123", role: "creator" });
    expect(verifyToken(token)).toEqual({ id: "abc123", role: "creator" });
  });

  it("rejects a tampered token", () => {
    const token = signToken({ id: "abc123", role: "creator" });
    expect(() => verifyToken(token.slice(0, -2) + "xx")).toThrow("Invalid or expired token");
  });

  it("rejects a token signed with another secret", () => {
    const forged = jwt.sign({ role: "brand" }, "some-other-secret-value", { subject: "abc123" });
    expect(() => verifyToken(forged)).toThrow("Invalid or expired token");
  });

  it("rejects an expired token", () => {
    const expired = jwt.sign({ role: "brand" }, process.env.JWT_SECRET as string, { subject: "abc123", expiresIn: -10 });
    expect(() => verifyToken(expired)).toThrow("Invalid or expired token");
  });

  it("rejects a token whose role is not a known role", () => {
    const bad = jwt.sign({ role: "admin" }, process.env.JWT_SECRET as string, { subject: "abc123" });
    expect(() => verifyToken(bad)).toThrow("Invalid or expired token");
  });
});