"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
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
    <AuthShell>
      <Card className="card rise md:min-w-0 gap-5 pb-7">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-900">Welcome back</CardTitle>
          <CardDescription className="mt-1 text-sm text-neutral-600">Log in to manage campaigns or track your earnings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <ErrorBanner error={error} />
            <Field label="Email" htmlFor="login-email">
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </Field>
            <Field label="Password" htmlFor="login-password">
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="w-full"
              />
            </Field>
            <Button type="submit" size="lg" pending={submitting} className="mt-1 w-full">
              {submitting ? "Logging in…" : "Log in"}
            </Button>
            <p className="text-center text-sm text-neutral-600">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-[#2f6db5] hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
