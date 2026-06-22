"use client";
import { useState, useRef, useId, type KeyboardEvent } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  label?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Escribe y presiona Enter",
  maxTags = 20,
  suggestions = [],
  label,
  disabled = false,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))
    .slice(0, 6);

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || value.includes(clean) || value.length >= maxTags) return;
    onChange([...value, clean]);
    setInput("");
    setShowSuggestions(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--muted-strong)" }}>
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          minHeight: 44,
          padding: "6px 10px",
          background: "var(--surface)",
          border: "1.5px solid var(--line)",
          borderRadius: 8,
          cursor: "text",
          alignItems: "center",
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "var(--blue-soft, #dce6f1)",
              color: "var(--blue-dark, #004182)",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                aria-label={`Quitar ${tag}`}
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1, fontSize: 14 }}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && value.length < maxTags && (
          <input
            ref={inputRef}
            id={id}
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKey}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={value.length === 0 ? placeholder : ""}
            style={{
              flex: "1 1 120px",
              minWidth: 80,
              border: 0,
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: "var(--text)",
            }}
            aria-label={label ?? placeholder}
          />
        )}
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            listStyle: "none",
            margin: "4px 0 0",
            padding: "4px 0",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            boxShadow: "var(--shadow-soft)",
            position: "absolute",
            zIndex: 100,
            minWidth: 200,
          }}
        >
          {filteredSuggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 14px",
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>
        {value.length}/{maxTags} · Enter o coma para agregar
      </p>
    </div>
  );
}
