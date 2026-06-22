"use client";
import { useRef, useState, DragEvent, ChangeEvent } from "react";

interface FileDropZoneProps {
  accept?: string;
  maxSizeMb?: number;
  onFile: (file: File) => void;
  label?: string;
}

export function FileDropZone({
  accept = "*/*",
  maxSizeMb = 5,
  onFile,
  label = "Arrastra un archivo aquí o haz clic para seleccionar",
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    if (file.size > maxSizeMb * 1024 * 1024)
      return `El archivo supera los ${maxSizeMb} MB.`;
    if (accept !== "*/*") {
      const types = accept.split(",").map((t) => t.trim());
      const ok = types.some(
        (t) =>
          file.type === t ||
          (t.startsWith(".") && file.name.endsWith(t))
      );
      if (!ok) return `Tipo de archivo no permitido.`;
    }
    return null;
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFile(file);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--blue)" : "var(--line-strong)"}`,
          borderRadius: 8,
          padding: "32px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--blue-soft)" : "var(--surface-muted)",
          transition: "border-color 160ms, background 160ms",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
          Máximo {maxSizeMb} MB
        </p>
      </div>
      {error && (
        <p style={{ color: "var(--coral)", fontSize: 12, marginTop: 6 }}>{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
