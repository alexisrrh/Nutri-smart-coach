export function fieldControlClass(className = "") {
  return `w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-sm font-bold text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-[var(--app-border)] ${className}`;
}
