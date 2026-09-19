import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="flex items-center justify-between border-t border-ink-100 px-1 pt-4">
      <p className="text-xs text-ink-400">
        หน้า {page} / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <PageLink href={buildHref(Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
        </PageLink>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 && (
              <span className="px-1 text-ink-300">…</span>
            )}
            <PageLink href={buildHref(p)} active={p === page}>
              {p}
            </PageLink>
          </span>
        ))}
        <PageLink
          href={buildHref(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-ink-200">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
        active ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-ink-50"
      }`}
    >
      {children}
    </Link>
  );
}
