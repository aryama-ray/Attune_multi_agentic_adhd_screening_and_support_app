"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import Card from "@/components/ui/Card";

export default function SignUpPage() {
  const { user, register } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as registered user → skip signup
  useEffect(() => {
    if (!user || user.isGuest) return;
    router.replace(user.hasConsented ? "/screening" : "/consent");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    await register(name.trim(), email.trim(), password);
    setSubmitting(false);
    router.push("/consent");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card padding="lg" className="w-full max-w-md">
        <h1 className="mb-1 font-serif text-2xl font-bold text-foreground">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Join Attune to get your personalised daily plan.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Smith"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/" className="text-primary underline-offset-2 hover:underline">
            Go back home
          </Link>
        </p>
      </Card>
    </div>
  );
}
