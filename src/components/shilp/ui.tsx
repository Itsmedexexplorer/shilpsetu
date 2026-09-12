import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cleanText, digitsOnly, LIMITS } from "@/lib/validate";
import { cn } from "@/lib/utils";

export function Screen({
  children,
  tone = "ivory",
  className,
}: {
  children: ReactNode;
  tone?: "ivory" | "forest" | "black";
  className?: string;
}) {
  const tones = {
    ivory: "bg-ivory text-charcoal",
    forest: "bg-forest-deep text-ivory",
    black: "bg-black text-white",
  };
  return (
    <div className={cn("flex min-h-full flex-col", tones[tone], className)}>
      {children}
    </div>
  );
}

export function TopBar({
  title,
  step,
  onBack,
  dark,
}: {
  title?: string;
  step?: string;
  onBack?: () => void;
  dark?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-2">
      <button
        aria-label="Go back"
        onClick={() => (onBack ? onBack() : router.history.back())}
        className={cn(
          "press grid h-11 w-11 shrink-0 place-items-center rounded-full border",
          dark ? "border-white/20 text-white" : "border-charcoal/15 text-charcoal",
        )}
      >
        <ArrowLeft size={20} />
      </button>
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="truncate text-sm font-semibold tracking-wide uppercase opacity-70">
            {title}
          </p>
        ) : null}
      </div>
      {step ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
            dark ? "bg-white/10 text-white" : "bg-forest/10 text-forest",
          )}
        >
          {step}
        </span>
      ) : null}
    </div>
  );
}

export function Title({
  children,
  sub,
  className,
}: {
  children: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-rise px-5 pt-2 pb-5", className)}>
      <h1 className="text-[2rem] leading-[1.05] font-extrabold text-balance">
        {children}
      </h1>
      {sub ? <p className="mt-2 text-[0.95rem] opacity-70">{sub}</p> : null}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "forest" | "ghost" | "outline";
  icon?: ReactNode;
};

export function Btn({
  variant = "primary",
  icon,
  className,
  children,
  ...rest
}: BtnProps) {
  const variants = {
    primary: "bg-terracotta text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,.55)]",
    forest: "bg-forest text-ivory shadow-[0_10px_24px_-12px_rgba(0,0,0,.55)]",
    ghost: "bg-transparent text-current underline underline-offset-4",
    outline: "border-2 border-current bg-transparent text-current",
  };
  return (
    <button
      {...rest}
      className={cn(
        "press inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold tracking-tight",
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 mt-auto space-y-2 bg-gradient-to-t from-current/0 px-5 pt-4 pb-6 [background:linear-gradient(to_top,var(--tw-gradient-stops))]">
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  onChange,
  maxLength,
  inputMode,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
}) {
  const numeric = inputMode === "numeric";
  const cap = maxLength ?? (numeric ? LIMITS.price : LIMITS.name * 2);
  return (
    <label className="block">
      <span className="text-xs font-bold tracking-[0.12em] uppercase opacity-60">
        {label}
      </span>
      <input
        {...rest}
        inputMode={inputMode}
        maxLength={cap}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          const next = numeric
            ? digitsOnly(e.target.value, cap)
            : cleanText(e.target.value, cap);
          if (next !== e.target.value) e.target.value = next;
          onChange?.(e);
        }}
        className={cn(
          "mt-2 h-14 w-full rounded-2xl border-2 bg-white px-4 text-base font-semibold outline-none focus:border-terracotta",
          error ? "border-destructive/60" : "border-charcoal/12",
        )}
      />
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs opacity-55">{hint}</span>
      ) : null}
    </label>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  rows = 5,
  maxLength = LIMITS.message,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-2 text-xs font-bold tracking-[0.12em] uppercase opacity-60">
        {label}
        <span className="tabular-nums">
          {value.length}/{maxLength}
        </span>
      </span>
      <textarea
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(cleanText(e.target.value, maxLength))}
        className="mt-2 w-full rounded-2xl border-2 border-charcoal/12 bg-white p-4 text-base leading-relaxed outline-none focus:border-terracotta"
      />
    </label>
  );
}

export function AiBadge({ children = "AI Generated" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-3 py-1.5 text-xs font-extrabold text-charcoal">
      ✦ {children}
    </span>
  );
}

export function Motif({ className }: { className?: string }) {
  return <div className={cn("motif-band h-1.5 w-24 rounded-full", className)} />;
}

export function ErrorNote({
  message,
  onRetry,
  onSkip,
}: {
  message: string;
  onRetry: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-destructive/25 bg-destructive/8 p-4">
      <p className="text-sm font-semibold">{message}</p>
      <p className="mt-1 text-xs opacity-70">Your product information is safe.</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onRetry}
          className="press rounded-xl bg-charcoal px-4 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
        {onSkip ? (
          <button
            onClick={onSkip}
            className="press rounded-xl border-2 border-charcoal/20 px-4 py-2 text-sm font-bold"
          >
            Continue with saved info
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function StatusChip({
  status,
}: {
  status: "published" | "draft" | "soldout";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold tracking-wide uppercase",
        status === "published"
          ? "bg-forest text-ivory"
          : status === "soldout"
            ? "bg-terracotta text-white"
            : "bg-sand text-charcoal/70 ring-1 ring-charcoal/10",
      )}
    >
      {status === "soldout" ? "Out of stock" : status}
    </span>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="craft-texture rounded-3xl border-2 border-dashed border-charcoal/15 px-6 py-12 text-center">
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="mx-auto mt-2 max-w-[16rem] text-sm opacity-65">{body}</p>
    </div>
  );
}
