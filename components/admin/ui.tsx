"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6 sm:py-4">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className={padded ? "p-4 sm:p-6" : undefined}>{children}</div>
    </div>
  );
}

export function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  hint,
}: {
  title: string;
  value: string;
  delta?: number | null;
  icon?: LucideIcon;
  hint?: string;
}) {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = showDelta && (delta as number) >= 0;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-zinc-400" />}
      </div>
      <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-1 text-xs">
        {showDelta ? (
          <>
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                positive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta as number).toFixed(1)}%
            </span>
            <span className="text-zinc-400">vs previous period</span>
          </>
        ) : (
          <span className="text-zinc-400">{hint ?? "no prior data"}</span>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Icon className="h-6 w-6 text-zinc-400" />
        </div>
      )}
      <p className="font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Table wrapper that scrolls horizontally on narrow screens. */
export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400",
        className,
      )}
    >
      {children}
    </th>
  );
}

export const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  NG: "🇳🇬",
  GH: "🇬🇭",
  ZA: "🇿🇦",
  KE: "🇰🇪",
  BW: "🇧🇼",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  NL: "🇳🇱",
  IE: "🇮🇪",
  CN: "🇨🇳",
  AE: "🇦🇪",
};

export function countryFlag(code?: string | null): string {
  if (!code) return "🌍";
  return COUNTRY_FLAGS[code.toUpperCase()] ?? "🌍";
}

export const SOURCE_COLORS: Record<string, string> = {
  google: "#4285F4",
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  tiktok: "#71767B",
  pinterest: "#BD081C",
  direct: "#10B981",
  organic: "#34D399",
  referral: "#8B5CF6",
  email: "#F59E0B",
  paid: "#EF4444",
  whatsapp: "#25D366",
  bing: "#00897B",
  yahoo: "#6001D2",
  duckduckgo: "#DE5833",
};
