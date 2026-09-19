"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";

export type FilterSelect = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

export function TableFilterBar({
  searchKey = "q",
  searchPlaceholder = "ค้นหา...",
  selects = [],
  hideSearch = false,
}: {
  searchKey?: string;
  searchPlaceholder?: string;
  selects?: FilterSelect[];
  hideSearch?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get(searchKey) ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page"); // เปลี่ยน filter แล้วกลับไปหน้า 1 เสมอ
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(v: string) {
    setQ(v);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => updateParams({ [searchKey]: v }),
      350,
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {!hideSearch && (
        <div className="relative min-w-45 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-300" />
          <input
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-ink-100 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          />
        </div>
      )}
      {selects.map((s) => (
        <select
          key={s.key}
          defaultValue={searchParams.get(s.key) ?? ""}
          onChange={(e) => updateParams({ [s.key]: e.target.value })}
          className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">{s.label}: ทั้งหมด</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
