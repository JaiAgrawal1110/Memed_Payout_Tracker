"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken, setUnauthorizedHandler } from "./api";
import type { Role, SignupInput, User } from "./types";

const TOKEN_KEY = "memed.token";

interface AuthState {
  user: User | null;
  /** True until we've checked localStorage / validated the stored token. */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const homePathFor = (role: Role): string => (role === "brand" ? "/brand" : "/creator");

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable (private mode): the session just won't survive a reload
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    storeToken(null);
    setUser(null);
  }, []);

  const startSession = useCallback((token: string, nextUser: User) => {
    setAuthToken(token);
    storeToken(token);
    setUser(nextUser);
  }, []);

  // Restore a previous session: validate the stored token against the API.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    let cancelled = false;

    const token = readStoredToken();
    if (token) setAuthToken(token);
    const session: Promise<User | null> = token ? api.me().then((res) => res.user) : Promise.resolve(null);

    session
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: nextUser, token } = await api.login(email, password);
      startSession(token, nextUser);
      return nextUser;
    },
    [startSession],
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      const { user: nextUser, token } = await api.signup(input);
      startSession(token, nextUser);
      return nextUser;
    },
    [startSession],
  );

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, signup, logout: clearSession }),
    [user, loading, login, signup, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/**
 * Guards a page for one role. Sends logged-out users to /login and users of the other role to their own page.
 * `ready` is true only when the right kind of user is signed in.
 */
export function useRequireRole(role: Role): { user: User | null; ready: boolean } {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(homePathFor(user.role));
  }, [loading, user, role, router]);

  return { user, ready: !loading && user?.role === role };
}

/** For /login and /signup: bounce already-signed-in users to their home page. */
export function useRedirectIfSignedIn(): void {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace(homePathFor(user.role));
  }, [loading, user, router]);
}
