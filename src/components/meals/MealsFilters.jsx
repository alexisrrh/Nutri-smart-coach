export function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wide transition ${
        active
          ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_18px_var(--app-glow)]"
          : "text-[var(--app-muted)] hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]"
      }`}
    >
      {children}
    </button>
  );
}
