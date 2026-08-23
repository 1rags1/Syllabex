/** Shared UI primitives for the academic dashboard design system. */

import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
};

export function Card({
  children,
  hover = true,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`glass rounded-2xl ${hover ? "glass-hover" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
};

const TONE_STYLES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-white/5 text-zinc-300 border-white/10",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export function Badge({
  children,
  tone = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
