"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import PageContainer from "@/components/layout/PageContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PlanPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user === null) router.replace("/");
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <PageContainer>
      <h1 className="font-serif text-3xl font-bold text-foreground">My Plan</h1>
      <p className="mt-3 text-muted-foreground">Coming soon — your personalized daily schedule will appear here.</p>
    </PageContainer>
  );
}
