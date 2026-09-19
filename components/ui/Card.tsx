import { type ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-ink-100 bg-white ${
        padded ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-ink-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-ink-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
