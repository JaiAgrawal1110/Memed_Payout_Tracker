export const formatINR = (amount: number): string => `₹${amount.toLocaleString("en-IN")}`;

/** Round view counts read like the brief ("10K", "100K", "2.5M"); anything else gets grouped digits. */
export const formatViews = (views: number): string => {
  if (views >= 1_000_000 && views % 100_000 === 0) return `${views / 1_000_000}M`;
  if (views >= 1_000 && views % 1_000 === 0) return `${views / 1_000}K`;
  return views.toLocaleString("en-IN");
};

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "?";
