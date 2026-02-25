"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/ui/Button";

interface GuestLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function GuestLoginButton({ className, children }: GuestLoginButtonProps) {
  const { user, loginAsGuest } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!user) {
      setLoading(true);
      try {
        await loginAsGuest();
        // Alex has hasProfile: true, redirect to /plan for demo
        router.push("/plan");
      } catch {
        // If backend is down, fall back to screening
        router.push("/screening");
      } finally {
        setLoading(false);
      }
      return;
    }
    router.push(user.hasProfile ? "/plan" : "/screening");
  }

  return (
    <Button variant="outline" size="lg" onClick={handleClick} isLoading={loading} className={className}>
      {children ?? "Continue as Guest"}
    </Button>
  );
}
