/** True for MongoDB's duplicate-key error (unique index violation). */
export function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === 11000;
}
