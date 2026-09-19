import { type ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 px-4 py-2.5 shadow-sm shadow-brand-900/10",
  secondary:
    "border border-ink-100 text-ink-600 hover:border-brand-300 hover:text-brand-700 px-4 py-2.5",
  ghost: "text-ink-500 hover:text-brand-600 px-2 py-1",
  danger: "text-red-600 hover:text-red-700 px-2 py-1",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`}
    />
  );
}
