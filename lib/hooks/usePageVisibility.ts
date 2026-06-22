"use client";
import { useState, useEffect } from "react";

export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true
  );

  useEffect(() => {
    function handle() {
      setVisible(document.visibilityState === "visible");
    }
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);

  return visible;
}
