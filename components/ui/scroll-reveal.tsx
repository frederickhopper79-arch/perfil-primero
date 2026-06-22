"use client";
import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  style?: CSSProperties;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 20,
  style,
  className,
}: ScrollRevealProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translateMap = {
    up: `0, ${distance}px`,
    down: `0, -${distance}px`,
    left: `${distance}px, 0`,
    right: `-${distance}px, 0`,
    none: "0, 0",
  };

  const initial: CSSProperties = reduced
    ? {}
    : { opacity: 0, transform: `translate(${translateMap[direction]})` };
  const final: CSSProperties = reduced
    ? {}
    : { opacity: 1, transform: "translate(0, 0)", transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` };

  return (
    <div ref={ref} className={className} style={{ ...(!visible ? initial : final), ...style }}>
      {children}
    </div>
  );
}
