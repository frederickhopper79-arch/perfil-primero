"use client";
import { useRef, useState, ChangeEvent } from "react";

interface ImagePreviewProps {
  onFile: (file: File) => void;
  currentSrc?: string;
  label?: string;
  maxSizeMb?: number;
}

export function ImagePreview({
  onFile,
  currentSrc,
  label = "Cambiar foto",
  maxSizeMb = 5,
}: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(currentSrc ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`La imagen no puede superar los ${maxSizeMb} MB.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    onFile(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {preview ? (
        <img
          src={preview}
          alt="Vista previa"
          style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--line)" }}
        />
      ) : (
        <div
          style={{
            width: 96, height: 96, borderRadius: "50%",
            background: "var(--bg-soft)", border: "2px dashed var(--line-strong)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted)", fontSize: 32,
          }}
        >
          +
        </div>
      )}
      <button
        type="button"
        className="button secondary"
        onClick={() => inputRef.current?.click()}
        style={{ fontSize: 13, padding: "6px 14px" }}
      >
        {label}
      </button>
      {error && <p style={{ color: "var(--coral)", fontSize: 12, margin: 0 }}>{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
