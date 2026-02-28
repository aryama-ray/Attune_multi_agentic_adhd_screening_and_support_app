"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, UserBackground, TodayFeeling } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { createGuestSession } from "@/lib/api";
import { saveTodayPoint } from "@/lib/trendStore";

// ─── Context ──────────────────────────────────────────────────────────────────

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<"ok" | "not_found" | "wrong_password">;
  loginAsGuest: () => Promise<void>;
  giveConsent: () => void;
  saveBackground: (bg: UserBackground) => void;
  updateTodayFeeling: (feeling: TodayFeeling) => void;
  updateDemographics: (fields: Omit<UserBackground, "todayFeeling">) => void;
  logout: () => void;
  markProfileComplete: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

// ─── Per-user persistent flags ────────────────────────────────────────────────
// Stored under attune_flags_<userId> — survives logout and session expiry.

interface UserFlags {
  hasConsented: boolean;
  hasBackground: boolean;
  hasProfile: boolean;
  background?: UserBackground;
}

function flagsKey(userId: string) {
  return `attune_flags_${userId}`;
}

function loadFlags(userId: string): UserFlags {
  try {
    const raw = localStorage.getItem(flagsKey(userId));
    if (raw) return JSON.parse(raw) as UserFlags;
  } catch { /* ignore */ }
  return { hasConsented: false, hasBackground: false, hasProfile: false };
}

function saveFlags(user: User) {
  try {
    const flags: UserFlags = {
      hasConsented: user.hasConsented,
      hasBackground: user.hasBackground,
      hasProfile: user.hasProfile,
      background: user.background,
    };
    localStorage.setItem(flagsKey(user.id), JSON.stringify(flags));
  } catch { /* ignore */ }
}

// ─── Session-level storage (cleared on logout / session expiry) ───────────────

function persistUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  saveFlags(user); // always keep per-user flags in sync
}

/**
 * Read the current session user from localStorage and snapshot their flags to
 * the per-user key BEFORE the session key is cleared. This ensures flags
 * survive logout and Supabase session invalidation.
 */
function snapshotFlagsFromSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) saveFlags(JSON.parse(raw) as User);
  } catch { /* ignore */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore active session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Try localStorage first (fastest path — already has flags)
          const raw = localStorage.getItem(STORAGE_KEYS.USER);
          if (raw) {
            const parsed = JSON.parse(raw) as User;
            if (parsed.id === session.user.id) {
              setUser(parsed);
              return;
            }
          }
          // Fallback: rebuild from session + per-user flags
          const flags = loadFlags(session.user.id);
          const hasProfile = flags.hasProfile;
          const hasBackground = flags.hasBackground || hasProfile;
          const rebuilt: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name ?? "User",
            email: session.user.email,
            isGuest: session.user.is_anonymous ?? false,
            hasConsented: flags.hasConsented || hasBackground,
            hasBackground,
            hasProfile,
            background: flags.background,
            createdAt: session.user.created_at,
          };
          setUser(rebuilt);
          persistUser(rebuilt);
        } else {
          // No Supabase session — fall back to localStorage (offline/demo)
          const raw = localStorage.getItem(STORAGE_KEYS.USER);
          if (raw) setUser(JSON.parse(raw) as User);
        }
      } catch {
        // Supabase unavailable — fall back to localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.USER);
          if (raw) setUser(JSON.parse(raw) as User);
        } catch { /* ignore malformed data */ }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();

    // When session is invalidated (token refresh failure, sign-out from another tab):
    // snapshot flags BEFORE clearing the session key so they survive.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          snapshotFlagsFromSession();
          setUser(null);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────────

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;

        const newUser: User = {
          id: data.user!.id,
          name,
          email: email.toLowerCase(),
          isGuest: false,
          hasConsented: false,
          hasBackground: false,
          hasProfile: false,
          createdAt: new Date().toISOString(),
        };

        setUser(newUser);
        persistUser(newUser);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Login ────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<"ok" | "not_found" | "wrong_password"> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login")) return "wrong_password";
          return "not_found";
        }

        // Restore onboarding progress from per-user flags (survives logout)
        const flags = loadFlags(data.user.id);

        // If they have a profile they definitely did the background form too
        const hasProfile = flags.hasProfile;
        const hasBackground = flags.hasBackground || hasProfile;

        const userData: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name ?? "User",
          email: data.user.email,
          isGuest: false,
          hasConsented: true, // registered users have always accepted terms
          hasBackground,
          hasProfile,
          background: flags.background,
          createdAt: data.user.created_at,
        };

        setUser(userData);
        persistUser(userData);
        return "ok";
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Guest login ──────────────────────────────────────────────────────────

  const loginAsGuest = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInAnonymously();

      if (authError || !authData.user) {
        // Supabase unavailable — local-only guest (offline mode)
        const guest: User = {
          id: crypto.randomUUID(),
          name: "Guest",
          isGuest: true,
          hasConsented: false,
          hasBackground: false,
          hasProfile: false,
          createdAt: new Date().toISOString(),
        };
        setUser(guest);
        persistUser(guest);
        return;
      }

      // Call backend to seed Alex demo data
      let guestData;
      try {
        guestData = await createGuestSession();
      } catch {
        guestData = null;
      }

      const userId = guestData?.userId ?? authData.user.id;

      // Restore onboarding progress from per-user flags (survives logout)
      const flags = loadFlags(userId);
      const hasProfile = guestData?.hasProfile ?? flags.hasProfile;
      const hasBackground = flags.hasBackground || hasProfile;

      const guest: User = {
        id: userId,
        name: guestData?.name ?? "Alex",
        isGuest: true,
        hasConsented: flags.hasConsented || hasBackground, // bg implies consent
        hasBackground,
        hasProfile,
        background: flags.background,
        createdAt: new Date().toISOString(),
      };

      setUser(guest);
      persistUser(guest);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    // Snapshot flags before clearing the session key
    snapshotFlagsFromSession();
    supabase.auth.signOut().catch(() => { /* best-effort */ });
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // per-user flags key is kept — restored on next login
  }, []);

  // ─── Local state mutations ────────────────────────────────────────────────

  function updateAndPersist(updater: (u: User) => User) {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      persistUser(updated); // also calls saveFlags
      return updated;
    });
  }

  function giveConsent() {
    updateAndPersist((u) => ({ ...u, hasConsented: true }));
  }

  function saveBackground(bg: UserBackground) {
    updateAndPersist((u) => ({ ...u, hasBackground: true, background: bg }));
  }

  function updateTodayFeeling(feeling: TodayFeeling) {
    updateAndPersist((u) => ({
      ...u,
      background: u.background
        ? { ...u.background, todayFeeling: feeling }
        : undefined,
    }));
    if (user) {
      const avg =
        (feeling.focusLevel +
          feeling.energyLevel +
          feeling.moodLevel +
          feeling.calmLevel) /
        4;
      saveTodayPoint(user.id, Math.round(avg * 2));
    }
  }

  function updateDemographics(fields: Omit<UserBackground, "todayFeeling">) {
    updateAndPersist((u) => {
      if (!u.background) return u;
      return {
        ...u,
        background: { ...fields, todayFeeling: u.background.todayFeeling },
      };
    });
  }

  function markProfileComplete() {
    updateAndPersist((u) => ({ ...u, hasProfile: true }));
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        register,
        login,
        loginAsGuest,
        giveConsent,
        saveBackground,
        updateTodayFeeling,
        updateDemographics,
        logout,
        markProfileComplete,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
