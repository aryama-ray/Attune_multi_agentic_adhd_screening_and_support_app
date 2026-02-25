"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createGuestSession } from "@/lib/api";
import type { User } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, []);

  const loginAsGuest = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await createGuestSession();
      // Backend returns { userId, name, isGuest, hasProfile }
      // Frontend User type uses `id` — map here
      const guest: User = {
        id: data.userId,
        name: data.name,
        isGuest: data.isGuest,
        hasProfile: data.hasProfile,
        createdAt: new Date().toISOString(),
      };
      setUser(guest);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guest));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, loginAsGuest, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
