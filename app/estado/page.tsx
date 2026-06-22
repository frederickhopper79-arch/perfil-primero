"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EstadoRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/consola-admin");
  }, [router]);
  return null;
}
