export function StatusPill({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "soft" | "line" }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}
