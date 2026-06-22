"use client";
import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { storageGet } from "@/lib/utils/storage";

// Definición de feature flags de Perfil Primero
export interface FeatureFlags {
  /** Tour guiado para workers */
  workerTour: boolean;
  /** Drag & drop en lista de educación */
  educationDragDrop: boolean;
  /** Búsqueda diferida en empresa */
  deferredSearch: boolean;
  /** Confetti al completar perfil */
  profileConfetti: boolean;
  /** Banner sticky de onboarding */
  onboardingBanner: boolean;
  /** Análisis de CV con IA */
  cvAnalysis: boolean;
  /** Comparación de candidatos */
  candidateComparison: boolean;
  /** Panel de análisis de expertos */
  expertPanel: boolean;
  /** Notificaciones push */
  pushNotifications: boolean;
  /** Modo offline */
  offlineMode: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  workerTour: true,
  educationDragDrop: true,
  deferredSearch: true,
  profileConfetti: true,
  onboardingBanner: true,
  cvAnalysis: true,
  candidateComparison: true,
  expertPanel: true,
  pushNotifications: true,
  offlineMode: true,
};

const FeatureFlagContext = createContext<FeatureFlags>(DEFAULT_FLAGS);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

  useEffect(() => {
    // En desarrollo, se pueden sobrescribir flags desde localStorage
    if (process.env.NODE_ENV === "development") {
      const overrides = storageGet<Partial<FeatureFlags>>("feature_flags", {});
      setFlags((prev) => ({ ...prev, ...overrides }));
    }
  }, []);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag<K extends keyof FeatureFlags>(flag: K): FeatureFlags[K] {
  return useContext(FeatureFlagContext)[flag];
}

/** Renderiza children solo si el flag está activado */
export function Feature({ flag, children, fallback }: { flag: keyof FeatureFlags; children: ReactNode; fallback?: ReactNode }) {
  const enabled = useFeatureFlag(flag);
  return <>{enabled ? children : (fallback ?? null)}</>;
}
