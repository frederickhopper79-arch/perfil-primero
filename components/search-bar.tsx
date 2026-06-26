"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  redirectTo?: string;
  size?: "sm" | "md" | "lg";
}

export function SearchBar({ placeholder = "Buscar por cargo, habilidad o sector...", redirectTo = "/empresa", size = "md" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`${redirectTo}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const padding = size === "lg" ? "14px 18px" : size === "sm" ? "8px 12px" : "11px 14px";
  const fontSize = size === "lg" ? 15 : size === "sm" ? 12 : 14;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, width: "100%", maxWidth: size === "lg" ? 540 : size === "sm" ? 300 : 420 }} role="search">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar perfiles"
        style={{
          flex: 1,
          padding,
          borderRadius: 10,
          border: "1px solid var(--line)",
          fontSize,
          background: "var(--bg)",
          color: "var(--text)",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          padding: size === "lg" ? "14px 22px" : "10px 16px",
          borderRadius: 10,
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
          fontWeight: 700,
          fontSize,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
        aria-label="Buscar"
      >
        Buscar
      </button>
    </form>
  );
}
