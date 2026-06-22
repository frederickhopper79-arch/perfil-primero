"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      filtered[selected].action();
      close();
    }
  }

  if (!open) return null;

  return (
    <div
      className="commandPaletteBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda rápida"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="commandPaletteBox" onKeyDown={handleKeyDown}>
        <input
          ref={inputRef}
          className="commandPaletteInput"
          placeholder="Buscar sección, acción..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
          aria-autocomplete="list"
          aria-controls="cmd-list"
        />
        <ul id="cmd-list" className="commandPaletteList" role="listbox">
          {filtered.length === 0 && (
            <li style={{ padding: "16px 20px", color: "var(--muted)", fontSize: 14 }}>
              Sin resultados
            </li>
          )}
          {filtered.map((item, i) => (
            <li
              key={item.id}
              className="commandPaletteItem"
              role="option"
              aria-selected={i === selected}
              onClick={() => { item.action(); close(); }}
            >
              {item.label}
              {item.shortcut && (
                <kbd className="cmdKbd">{item.shortcut}</kbd>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
