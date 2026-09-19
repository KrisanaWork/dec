"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Check, Search } from "lucide-react";

export type ComboOption = { value: string; label: string; sublabel?: string };

export function Combobox({
  name,
  options,
  defaultValue,
  value,
  onChange,
  placeholder = "พิมพ์เพื่อค้นหา...",
  required,
  disabled,
}: {
  name?: string;
  options: ComboOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = options.find((o) => o.value === selectedValue);

  const [query, setQuery] = useState(selectedOption?.label ?? "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // sync ข้อความที่แสดงเมื่อค่าที่เลือกเปลี่ยนจากภายนอก (เช่น controlled reset)
  useEffect(() => {
    const opt = options.find((o) => o.value === selectedValue);
    setQuery(opt?.label ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        const opt = options.find((o) => o.value === selectedValue);
        setQuery(opt?.label ?? "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue, options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === selectedOption?.label.toLowerCase()) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q),
    );
  }, [query, options, selectedOption]);

  function selectOption(opt: ComboOption) {
    if (isControlled) onChange?.(opt.value);
    else setInternalValue(opt.value);
    setQuery(opt.label);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedValue}
          required={required}
        />
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-300" />
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, filtered.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered[highlight]) selectOption(filtered[highlight]);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-ink-100 bg-white py-2.5 pl-9 pr-8 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:bg-ink-50 disabled:text-ink-400"
        />
        <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-300" />
      </div>
      {open && !disabled && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-ink-100 bg-white py-1 shadow-lg">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-ink-400">ไม่พบรายการ</li>
          )}
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(opt);
              }}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                i === highlight
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-700 hover:bg-ink-50"
              }`}
            >
              <span>
                {opt.label}
                {opt.sublabel && (
                  <span className="ml-1.5 text-xs text-ink-400">
                    {opt.sublabel}
                  </span>
                )}
              </span>
              {opt.value === selectedValue && (
                <Check className="h-3.5 w-3.5 text-brand-500" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
