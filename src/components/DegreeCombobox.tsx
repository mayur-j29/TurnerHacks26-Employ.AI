"use client";

import { useState, useRef, useEffect } from "react";
import { filterDegreeSuggestions } from "@/lib/degreeProfile";

interface DegreeComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function DegreeCombobox({ value, onChange }: DegreeComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = filterDegreeSuggestions(query);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const commit = (degree: string) => {
    const trimmed = degree.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setQuery(trimmed);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="degree-input" className="sr-only">
        Degree or field of study
      </label>
      <input
        id="degree-input"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim()) {
            e.preventDefault();
            commit(query);
          }
        }}
        placeholder="Type your degree (e.g. Psychology, CS, Nursing…)"
        className="input-field"
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 w-full card overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => commit(s)}
                className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim() && (
        <button
          type="button"
          onClick={() => commit(query)}
          className="mt-2 text-xs text-cyan-500 hover:text-cyan-400"
        >
          Use &ldquo;{query.trim()}&rdquo;
        </button>
      )}
    </div>
  );
}
