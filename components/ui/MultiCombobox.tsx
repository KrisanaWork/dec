"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export type ComboOption = { value: string; label: string };

export function MultiCombobox({
  name,
  options,
  defaultValues = [],
  placeholder = "พิมพ์เพื่อค้นหาแล้วเลือก",
}: {
  name: string;
  options: ComboOption[];
  defaultValues?: string[];
  placeholder?: string;
}) {
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) =>
        !selected.includes(o.value) &&
        (!q || o.label.toLowerCase().includes(q)),
    );
  }, [query, options, selected]);

  function toggle(value: string) {
    setSelected((prev) => [...prev, value]);
    setQuery("");
  }
  function remove(value: string) {
    setSelected((prev) => prev.filter((v) => v !== value));
  }

  return (
    <div ref={containerRef} className="relative">
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <div
        onClick={() => setOpen(true)}
        className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-100 bg-white p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15"
      >
        {selected.map((v) => {
          const opt = options.find((o) => o.value === v);
          if (!opt) return null;
          return (
            <span
              key={v}
              className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(v);
                }}
                className="text-brand-400 hover:text-brand-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        <div className="flex min-w-32.5 flex-1 items-center gap-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : "เพิ่มอีก..."}
            className="min-w-0 flex-1 border-none bg-transparent py-0.5 text-sm outline-none placeholder:text-ink-300"
          />
        </div>
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-ink-100 bg-white py-1 shadow-lg">
          {filtered.map((opt) => (
            <li
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                toggle(opt.value);
              }}
              className="cursor-pointer px-3 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
