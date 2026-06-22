"use client";
import { useState, useCallback } from "react";

interface UseMultiStepReturn {
  step: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  pct: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export function useMultiStep(totalSteps: number, initialStep = 0): UseMultiStepReturn {
  const [step, setStep] = useState(Math.max(0, Math.min(initialStep, totalSteps - 1)));

  const next = useCallback(() => setStep((s) => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const goTo = useCallback((s: number) => setStep(Math.max(0, Math.min(s, totalSteps - 1))), [totalSteps]);
  const reset = useCallback(() => setStep(0), []);

  return {
    step,
    totalSteps,
    isFirst: step === 0,
    isLast: step === totalSteps - 1,
    pct: totalSteps > 1 ? Math.round((step / (totalSteps - 1)) * 100) : 100,
    next,
    prev,
    goTo,
    reset,
  };
}
