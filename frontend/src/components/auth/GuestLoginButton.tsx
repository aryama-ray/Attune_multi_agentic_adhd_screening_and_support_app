"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { STORAGE_KEYS } from "@/lib/constants";
import type { User } from "@/types";
import Button from "@/components/ui/Button";

interface GuestLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

function routeUser(u: User, router: ReturnType<typeof useRouter>) {
  if (!u.hasConsented) { router.push("/consent"); return; }
  if (!u.hasBackground) { router.push("/background"); return; }
  router.push(u.hasProfile ? "/plan" : "/screening");
}

export default function GuestLoginButton({ className, children }: GuestLoginButtonProps) {
  const { user, loginAsGuest } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    // No session or current session is not a guest — create a fresh guest session
    if (!user || !user.isGuest) {
      setLoading(true);
      try {
        await loginAsGuest();
      } finally {
        setLoading(false);
      }
      // loginAsGuest calls persistUser synchronously, so localStorage is up-to-date
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        try {
          routeUser(JSON.parse(stored) as User, router);
          return;
        } catch { /* fall through */ }
      }
      router.push("/consent");
      return;
    }

    // Returning guest: resume from where they left off
    routeUser(user, router);
  }

  return (
    <Button variant="outline" size="lg" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading..." : (children ?? "Continue as Guest")}
    </Button>
  );
}
