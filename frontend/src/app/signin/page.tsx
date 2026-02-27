"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import Card from "@/components/ui/Card";

export default function SignInPage() {
  const { user, isLoading, login } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in as a registered user → route appropriately
  // Guests in localStorage should NOT block the sign-in form
  useEffect(() => {
    if (isLoading || !user || user.isGuest) return;
    if (!user.hasConsented) { router.replace("/consent"); return; }
    if (!user.hasBackground) { router.replace("/background"); return; }
    router.replace(user.hasProfile ? "/plan" : "/screening");
  }, [isLoading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result === "not_found") {
      setError("No account found with that email. Please sign up first.");
    } else if (result === "wrong_password") {
      setError("Incorrect password. Please try again.");
    }
    // "ok" → useEffect above redirects
  }

  if (isLoading || (user && !user.isGuest)) return null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card padding="lg" className="w-full max-w-md">
        <h1 className="mb-1 font-serif text-2xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sign in to continue your Attune journey.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">
          New to Attune?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-2 hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}
