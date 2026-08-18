import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SectionCard({ title, subtitle, action, children, className, id }: SectionCardProps) {
  return (
    <section
      id={id}
      className={`@container rounded-2xl border border-line bg-surface p-5 shadow-card ${className ?? ""}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-line text-sm text-ink-muted">
      {message}
    </div>
  );
}

export function ConnectPrompt({ label, envHint }: { label: string; envHint: string }) {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line px-4 text-center">
      <p className="text-sm font-medium text-ink">{label} isn&apos;t connected yet</p>
      <p className="max-w-xs text-xs text-ink-muted">
        Add {envHint} to the server environment to see live numbers here.
      </p>
    </div>
  );
}
