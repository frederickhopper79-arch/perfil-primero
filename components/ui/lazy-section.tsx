"use client";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}

export function LazySection({
  children,
  fallback = null,
  rootMargin = "100px",
}: LazySectionProps) {
  const [ref, visible] = useIntersectionObserver({ rootMargin });

  return (
    <div ref={ref} className="lazySection">
      {visible ? children : fallback}
    </div>
  );
}
