"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useDashboard } from "@/hooks/useDashboard";
import PageContainer from "@/components/layout/PageContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MomentumScore from "@/components/dashboard/MomentumScore";
import TrendChart from "@/components/dashboard/TrendChart";
import HypothesisCard from "@/components/dashboard/HypothesisCard";

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && user === null) router.replace("/");
  }, [userLoading, user, router]);

  const { data, isLoading: dashLoading } = useDashboard(user?.id ?? null);

  if (userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  if (dashLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading your dashboard…" />
      </div>
    );
  }

  // No data yet — user hasn't completed background questionnaire or just started
  if (!data) {
    return (
      <PageContainer>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-4xl">📊</p>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            No data yet
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your dashboard will populate after you complete the background
            questionnaire. Each day you check in, your trend will grow.
          </p>
          {!user.hasBackground && (
            <Link
              href="/background"
              className="mt-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              Complete questionnaire
            </Link>
          )}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Your Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.trend.length === 1
            ? `Today's snapshot, ${user.name}. Check back tomorrow to see your trend grow.`
            : `${data.trend.length} days tracked, ${user.name}.`}
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column (2/3 width) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <MomentumScore score={data.momentumScore} delta={data.momentumDelta} />
          <TrendChart trend={data.trend} annotations={data.annotations} />
        </div>

        {/* Right column (1/3 width) */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-widest text-faint-foreground">
            Agent Hypotheses
          </p>
          {data.hypotheses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Patterns will appear here as more data is collected.
            </p>
          ) : (
            data.hypotheses.map((h) => (
              <HypothesisCard key={h.id} hypothesis={h} />
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
