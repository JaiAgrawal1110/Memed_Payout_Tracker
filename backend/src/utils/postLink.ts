import type { Platform } from "../types";
import { AppError } from "./AppError";

const PLATFORM_HOSTS: Record<Platform, string[]> = {
  instagram: ["instagram.com"],
  youtube: ["youtube.com", "youtu.be"],
};

/**
 * Validates that `raw` is a link on the campaign's platform and returns a canonical form,
 * so the same post can't be submitted twice just by changing tracking params, `www.`, a trailing slash or `youtu.be`.
 *
 * Only the host is checked: we can't verify the post exists or who owns it (no platform API access).
 */
export function normalizePostLink(platform: Platform, raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw AppError.badRequest("Post link is not a valid URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw AppError.badRequest("Post link must start with http:// or https://");
  }

  const host = url.hostname.replace(/^(www|m)\./, "");
  const onPlatform = PLATFORM_HOSTS[platform].some((base) => host === base || host.endsWith(`.${base}`));
  if (!onPlatform) {
    throw AppError.badRequest(`This is a ${platform} campaign, so the link must be a ${platform} URL`);
  }

  const path = url.pathname.replace(/\/+$/, "");
  if (!path) {
    throw AppError.badRequest("The link must point to a specific post, not the site's home page");
  }

  if (platform === "youtube") {
    if (host === "youtu.be") {
      const id = path.split("/")[1];
      return `https://youtube.com/watch?v=${encodeURIComponent(id)}`;
    }
    if (path === "/watch") {
      const id = url.searchParams.get("v");
      if (!id) throw AppError.badRequest("YouTube watch links need a video id (?v=...)");
      return `https://${host}/watch?v=${encodeURIComponent(id)}`;
    }
  }

  // Everything else (Instagram posts/reels, YouTube shorts): drop query string and fragment (tracking params).
  return `https://${host}${path}`;
}
