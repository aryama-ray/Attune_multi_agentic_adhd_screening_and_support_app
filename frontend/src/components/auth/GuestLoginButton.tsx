"use client";

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

  function handleClick() {
    if (!user) {
      loginAsGuest();
      router.push("/consent");
      return;
    }
    // Returning user: skip consent if already given
    if (!user.hasConsented) { router.push("/consent"); return; }
    router.push(user.hasProfile ? "/plan" : "/screening");
  }

  return (
    <Button variant="outline" size="lg" onClick={handleClick} className={className}>
      {children ?? "Continue as Guest"}
    </Button>
  );
}
