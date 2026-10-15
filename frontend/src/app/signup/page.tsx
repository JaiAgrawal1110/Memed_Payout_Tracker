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
import type { Role } from "@/lib/types";

const ROLES: { value: Role; title: string; text: string }[] = [
  { value: "creator", title: "Creator", text: "Submit posts, hit milestones, earn." },
  { value: "brand", title: "Brand", text: "Run campaigns with a set budget." },
];

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
    <AuthShell>
      <Card className="card rise md:min-w-0 gap-5 pb-7">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-900">Create your account</CardTitle>
          <CardDescription className="mt-1 text-sm text-neutral-600">Pick a role. You can&apos;t change it later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <ErrorBanner error={error} />

            <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const selected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRole(r.value)}
                    className={`rounded-xl border p-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-[#2f6db5] ${
                      selected
                        ? "border-neutral-900 bg-white ring-1 ring-neutral-900"
                        : "border-[#d9d4c6] bg-transparent hover:border-neutral-500"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-neutral-900">{r.title}</span>
                    <span className="mt-0.5 block text-xs text-neutral-600">{r.text}</span>
                  </button>
                );
              })}
            </div>

            <Field label="Name" htmlFor="signup-name">
              <Input
                id="signup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name or brand"
                required
                minLength={2}
                className="w-full"
              />
            </Field>
            <Field label="Email" htmlFor="signup-email">
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </Field>
            <Field label="Password" htmlFor="signup-password" hint="At least 8 characters.">
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full"
              />
            </Field>

            <Button type="submit" size="lg" pending={submitting} className="mt-1 w-full">
              {submitting ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-neutral-600">
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-[#2f6db5] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
