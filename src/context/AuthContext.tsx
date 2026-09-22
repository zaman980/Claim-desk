import { createContext, useContext, useState, type ReactNode } from "react";
import type { CurrentUser } from "../types";

interface AuthContextValue {
  currentUser: CurrentUser | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_ADJUSTER: CurrentUser = {
  id: "adj-1",
  name: "Hassan Raza",
  email: "hassan.raza@claimdesk.demo",
  role: "adjuster",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const stored = localStorage.getItem("claimdesk-user");
    return stored ? JSON.parse(stored) : null;
  });

  function login() {

    setCurrentUser(DEMO_ADJUSTER);
    localStorage.setItem("claimdesk-user", JSON.stringify(DEMO_ADJUSTER));
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("claimdesk-user");
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
