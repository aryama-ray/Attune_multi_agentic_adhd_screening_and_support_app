"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import PageContainer from "@/components/layout/PageContainer";

export default function PlanPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/");
  }, [user, router]);

  if (!user) return null;

  return (
    <PageContainer>
      <h1 className="font-serif text-3xl font-bold text-foreground">My Plan</h1>
      <p className="mt-3 text-muted-foreground">Coming soon — your personalized daily schedule will appear here.</p>
    </PageContainer>
  );
}
