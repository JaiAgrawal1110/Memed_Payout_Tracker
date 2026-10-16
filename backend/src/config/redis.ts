import Redis from "ioredis";
import { env } from "./env";

export const LIVE_CAMPAIGNS_KEY = "campaigns:live";

let client: Redis | null = null;

if (env.REDIS_URL) {
  client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false, // fail fast when Redis is down instead of queuing
  });
  client.on("connect", () => console.log("Redis connected"));
  client.on("error", (err) => console.error("Redis error:", err.message));
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null; // fail open: fall back to Mongo
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 30
): Promise<void> {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    /* ignore cache failures */
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!client) return;
  try {
    await client.del(...keys);
  } catch {
    /* ignore cache failures */
  }
}
