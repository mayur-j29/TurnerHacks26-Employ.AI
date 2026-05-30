"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { UserContextType, PreparedFor } from "@/types";
import {
  clearSessionState,
  loadSession,
  loadUserProfile,
  migrateLegacyUserStorage,
  saveSessionState,
  saveUserProfile,
} from "@/lib/userProfiles";

const defaultContext: UserContextType = {
  isAuthenticated: false,
  email: null,
  preparingFor: null,
  degree: null,
  tutorialCompleted: false,
  setIsAuthenticated: () => {},
  setEmail: () => {},
  setPreparingFor: () => {},
  setDegree: () => {},
  setTutorialCompleted: () => {},
  login: () => ({ needsOnboarding: true }),
  logout: () => {},
};

const UserContext = createContext<UserContextType>(defaultContext);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [preparingFor, setPreparingFor] = useState<PreparedFor | null>(null);
  const [degree, setDegree] = useState<string | null>(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const skipProfileSave = useRef(false);

  const applyProfile = useCallback(
    (profile: {
      degree: string | null;
      preparingFor: PreparedFor | null;
      tutorialCompleted: boolean;
    }) => {
      skipProfileSave.current = true;
      setDegree(profile.degree);
      setPreparingFor(profile.preparingFor);
      setTutorialCompleted(profile.tutorialCompleted);
      queueMicrotask(() => {
        skipProfileSave.current = false;
      });
    },
    []
  );

  const login = useCallback(
    (userEmail: string): { needsOnboarding: boolean } => {
      const normalized = userEmail.trim().toLowerCase();
      const profile = loadUserProfile(normalized);

      skipProfileSave.current = true;
      setEmail(normalized);
      setIsAuthenticated(true);

      if (profile) {
        setDegree(profile.degree);
        setPreparingFor(profile.preparingFor);
        setTutorialCompleted(profile.tutorialCompleted);
      } else {
        setDegree(null);
        setPreparingFor(null);
        setTutorialCompleted(false);
      }

      saveSessionState({ isAuthenticated: true, email: normalized });
      queueMicrotask(() => {
        skipProfileSave.current = false;
      });

      const needsOnboarding = !profile?.degree || !profile?.preparingFor;
      return { needsOnboarding };
    },
    []
  );

  const logout = useCallback(() => {
    skipProfileSave.current = true;
    setIsAuthenticated(false);
    setEmail(null);
    setDegree(null);
    setPreparingFor(null);
    setTutorialCompleted(false);
    clearSessionState();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("employAI_lastSession");
    }
    queueMicrotask(() => {
      skipProfileSave.current = false;
    });
  }, []);

  useEffect(() => {
    migrateLegacyUserStorage();
    const session = loadSession();
    if (session.isAuthenticated && session.email) {
      const profile = loadUserProfile(session.email);
      setEmail(session.email);
      setIsAuthenticated(true);
      if (profile) {
        applyProfile(profile);
      }
    }
    setHydrated(true);
  }, [applyProfile]);

  useEffect(() => {
    if (!hydrated || skipProfileSave.current) return;
    saveSessionState({ isAuthenticated, email });
  }, [isAuthenticated, email, hydrated]);

  useEffect(() => {
    if (!hydrated || skipProfileSave.current || !email || !isAuthenticated) return;
    saveUserProfile(email, { degree, preparingFor, tutorialCompleted });
  }, [email, degree, preparingFor, tutorialCompleted, hydrated, isAuthenticated]);

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        email,
        preparingFor,
        degree,
        tutorialCompleted,
        setIsAuthenticated,
        setEmail,
        setPreparingFor,
        setDegree,
        setTutorialCompleted,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  return useContext(UserContext);
};
