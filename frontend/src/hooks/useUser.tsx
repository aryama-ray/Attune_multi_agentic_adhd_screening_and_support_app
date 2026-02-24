"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface UserContextValue {
  user: User | null;
  loginAsGuest: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch {
      // ignore malformed data
    }
  }, []);

  function loginAsGuest() {
    const guest: User = {
      id: crypto.randomUUID(),
      name: "Guest",
      isGuest: true,
      hasProfile: false,
      createdAt: new Date().toISOString(),
    };
    setUser(guest);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guest));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  return (
    <UserContext.Provider value={{ user, loginAsGuest, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
