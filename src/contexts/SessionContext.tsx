import { createContext, useContext, useState, type ReactNode } from "react";
import { clearAuthToken } from "@/services/api";

type SessionContextValue = {
  isLoggedIn: boolean;
  profile: UserProfile;
  enter: (profile: UserProfile) => void;
  updateProfile: (profile: UserProfile) => void;
  exit: () => void;
};

const SESSION_KEY = "doceria_session";
const PROFILE_KEY = "doceria_profile";

export type UserProfile = {
  id?: number;
  email: string;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

function readSession() {
  return localStorage.getItem(SESSION_KEY) === "active";
}

function readProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);

    return stored
      ? JSON.parse(stored)
      : { email: "" };
  } catch {
    return { email: "" };
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(readSession);
  const [profile, setProfile] = useState<UserProfile>(readProfile);

  const enter = (nextProfile: UserProfile) => {
    localStorage.setItem(SESSION_KEY, "active");
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));

    setIsLoggedIn(true);
    setProfile(nextProfile);
  };

  const updateProfile = (nextProfile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
  };

  const exit = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PROFILE_KEY);
    clearAuthToken();

    setIsLoggedIn(false);
    setProfile({ email: "" });
  };

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        profile,
        enter,
        updateProfile,
        exit,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession deve ser usado dentro de SessionProvider"
    );
  }

  return context;
}