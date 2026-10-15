import { Badge } from "@/components/tailgrids/core/badge";
import type { Platform } from "@/lib/types";
import { InstagramGlyph, YoutubeGlyph } from "./icons";

export function PlatformBadge({ platform }: { platform: Platform }) {
  return platform === "instagram" ? (
    <Badge color="pink" size="sm" suffixIcon={<InstagramGlyph />}>
      Instagram
    </Badge>
  ) : (
    <Badge color="error" size="sm" suffixIcon={<YoutubeGlyph />}>
      YouTube
    </Badge>
  );
}
