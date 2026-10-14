import type {
  AuthResult,
  BrandCampaign,
  Campaign,
  CreateCampaignInput,
  Earnings,
  LiveCampaign,
  SignupInput,
  Submission,
  User,
  ViewsUpdateResult,
} from "./types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export interface ErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Called when the API rejects a token we sent (expired/invalid), so the app can log the user out. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: ErrorDetail[] };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Cannot reach the server. Check your connection and try again.");
  }

  let json: Envelope<T> | null = null;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    // non-JSON response; handled below
  }

  if (!res.ok || !json?.success) {
    if (res.status === 401 && authToken) onUnauthorized?.();
    throw new ApiError(
      res.status,
      json?.error?.code ?? "UNKNOWN_ERROR",
      json?.error?.message ?? `Request failed (${res.status})`,
      json?.error?.details ?? [],
    );
  }
  return json.data as T;
}

/** Turns anything thrown into something displayable. */
export function describeError(err: unknown): { message: string; details: ErrorDetail[] } {
  if (err instanceof ApiError) return { message: err.message, details: err.details };
  if (err instanceof Error) return { message: err.message, details: [] };
  return { message: "Something went wrong", details: [] };
}

export const api = {
  signup: (input: SignupInput) => request<AuthResult>("POST", "/auth/signup", input),
  login: (email: string, password: string) => request<AuthResult>("POST", "/auth/login", { email, password }),
  me: () => request<{ user: User }>("GET", "/auth/me"),

  // brand
  createCampaign: (input: CreateCampaignInput) => request<{ campaign: Campaign }>("POST", "/campaigns", input),
  myCampaigns: () => request<{ campaigns: BrandCampaign[] }>("GET", "/campaigns/mine"),

  // creator
  liveCampaigns: () => request<{ campaigns: LiveCampaign[] }>("GET", "/campaigns"),
  submitPost: (campaignId: string, postLink: string) =>
    request<{ submission: Submission }>("POST", `/campaigns/${campaignId}/submissions`, { postLink }),
  earnings: () => request<Earnings>("GET", "/creators/me/earnings"),

  // simulates platform data (no auth needed by the API)
  updateViews: (submissionId: string, views: number) =>
    request<ViewsUpdateResult>("PATCH", `/submissions/${submissionId}/views`, { views }),
};
