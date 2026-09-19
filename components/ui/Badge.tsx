const tones = {
  success: "bg-emerald-50 text-emerald-700",
  neutral: "bg-ink-50 text-ink-500",
  brand: "bg-brand-50 text-brand-700",
  warning: "bg-amber-50 text-amber-700",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
