"use client";
import { useState, useEffect, useCallback } from "react";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  running: boolean;
}

export function useCountdown(targetDate: Date | null): CountdownState {
  const calc = useCallback((): CountdownState => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, running: false };
    const total = Math.max(0, targetDate.getTime() - Date.now());
    const s = Math.floor(total / 1000);
    return {
      total,
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      running: total > 0,
    };
  }, [targetDate]);

  const [state, setState] = useState<CountdownState>(calc);

  useEffect(() => {
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return state;
}
