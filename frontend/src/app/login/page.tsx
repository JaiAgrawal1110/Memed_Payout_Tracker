"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/ErrorBanner";
import { homePathFor, useAuth, useRedirectIfSignedIn } from "@/lib/auth";

export default function LoginPage() {
  useRedirectIfSignedIn();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.replace(homePathFor(user.role));
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <form className="card form narrow" onSubmit={handleSubmit}>
      <h1>Log in</h1>
      <ErrorBanner error={error} />
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </button>
      <p className="muted small">
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </form>
  );
}
