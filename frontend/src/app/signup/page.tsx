"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/ErrorBanner";
import { homePathFor, useAuth, useRedirectIfSignedIn } from "@/lib/auth";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  useRedirectIfSignedIn();
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("creator");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await signup({ name, email, password, role });
      router.replace(homePathFor(user.role));
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <form className="card form narrow" onSubmit={handleSubmit}>
      <h1>Create an account</h1>
      <ErrorBanner error={error} />

      <fieldset className="role-picker">
        <legend>I am a…</legend>
        <label className="radio">
          <input type="radio" name="role" checked={role === "creator"} onChange={() => setRole("creator")} /> Creator
        </label>
        <label className="radio">
          <input type="radio" name="role" checked={role === "brand"} onChange={() => setRole("brand")} /> Brand
        </label>
      </fieldset>

      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        Password (min 8 characters)
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? "Creating account…" : "Sign up"}
      </button>
      <p className="muted small">
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
