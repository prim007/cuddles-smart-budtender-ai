import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  experienceLevel: "beginner" | "intermediate" | "experienced" | null;
  preferredEffects: string[];
  flavorPreferences: string[];
  consumptionMethod: "smoke" | "vape" | "edible" | "tincture" | null;
  toleranceLevel: "low" | "medium" | "high" | null;
  language: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
  getProfileSummary: () => string;
}

const defaultProfile: UserProfile = {
  experienceLevel: null,
  preferredEffects: [],
  flavorPreferences: [],
  consumptionMethod: null,
  toleranceLevel: null,
  language: "en",
};

const STORAGE_KEY = "cuddles-user-profile";

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getProfileSummary = (): string => {
    const parts: string[] = [];
    
    if (profile.experienceLevel) {
      parts.push(`Experience: ${profile.experienceLevel}`);
    }
    if (profile.toleranceLevel) {
      parts.push(`Tolerance: ${profile.toleranceLevel}`);
    }
    if (profile.consumptionMethod) {
      parts.push(`Prefers: ${profile.consumptionMethod}`);
    }
    if (profile.preferredEffects.length > 0) {
      parts.push(`Effects: ${profile.preferredEffects.join(", ")}`);
    }
    if (profile.flavorPreferences.length > 0) {
      parts.push(`Flavors: ${profile.flavorPreferences.join(", ")}`);
    }
    
    return parts.length > 0 ? parts.join(". ") : "";
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, resetProfile, getProfileSummary }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
