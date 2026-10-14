import { normalizePostLink } from "../src/utils/postLink";

describe("normalizePostLink: instagram", () => {
  it("strips tracking params, www and trailing slash", () => {
    expect(normalizePostLink("instagram", "https://www.instagram.com/reel/AbC123/?igsh=xyz&utm_source=qr")).toBe(
      "https://instagram.com/reel/AbC123",
    );
  });

  it("treats http and https, www and bare host as the same post", () => {
    const a = normalizePostLink("instagram", "http://instagram.com/p/AbC123");
    const b = normalizePostLink("instagram", "https://www.instagram.com/p/AbC123/");
    expect(a).toBe(b);
  });

  it("keeps the path's case (shortcodes are case-sensitive)", () => {
    expect(normalizePostLink("instagram", "https://instagram.com/p/AbC")).not.toBe(
      normalizePostLink("instagram", "https://instagram.com/p/abc"),
    );
  });
});

describe("normalizePostLink: youtube", () => {
  it("keeps only the video id for watch links", () => {
    expect(normalizePostLink("youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=xyz")).toBe(
      "https://youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  it("converts youtu.be short links to the watch form", () => {
    expect(normalizePostLink("youtube", "https://youtu.be/dQw4w9WgXcQ?si=abc")).toBe(
      "https://youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  it("handles shorts and mobile hosts", () => {
    expect(normalizePostLink("youtube", "https://m.youtube.com/shorts/abc123?feature=share")).toBe(
      "https://youtube.com/shorts/abc123",
    );
  });

  it("requires a video id on watch links", () => {
    expect(() => normalizePostLink("youtube", "https://youtube.com/watch")).toThrow(/video id/);
  });
});

describe("normalizePostLink: rejections", () => {
  it.each([
    ["not a URL", "instagram", "just some text"],
    ["non-http scheme", "instagram", "ftp://instagram.com/p/abc"],
    ["javascript scheme", "instagram", "javascript:alert(1)"],
    ["wrong platform", "instagram", "https://youtube.com/watch?v=abc"],
    ["lookalike host", "instagram", "https://notinstagram.com/p/abc"],
    ["lookalike suffix", "instagram", "https://instagram.com.evil.io/p/abc"],
    ["site home page", "youtube", "https://youtube.com/"],
  ] as const)("rejects %s", (_label, platform, link) => {
    expect(() => normalizePostLink(platform, link)).toThrow();
  });
});
