"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ---------- базовый набор + variants ---------- */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-medium select-none cursor-pointer",
    "transition-colors transition-transform duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

    /* ring / outline */
    "outline-none focus-visible:ring-[3px] focus-visible:ring-[color:var(--sidebar-ring)/0.55]",
    "focus-visible:border-[color:var(--sidebar-ring)]",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/40",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ---------- зелёная фирменная ---------- */
        primary:
          // текст и тень
          "relative overflow-hidden text-[color:var(--primary-foreground)] shadow-xs " +
          // фон на before-слое
          "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] " +
          "before:bg-[color:var(--primary)] before:transition-colors before:duration-300 " +
          // состояния
          "hover:before:bg-[color:var(--primary)/.92] active:before:bg-[color:var(--primary)/.86] " +
          // мягкий scale
          "motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]",

        /* ---------- серая ---------- */
        secondary:
          "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] shadow-xs " +
          "hover:bg-[color:var(--secondary)/.92]",

        /* ---------- прозрачная с бордером ---------- */
        outline:
          "border border-[color:var(--border)] bg-transparent text-[color:var(--foreground)] " +
          "hover:bg-[color:var(--sidebar-accent)] hover:text-[color:var(--sidebar-accent-foreground)] " +
          "dark:hover:bg-[color:var(--sidebar-accent)/.40]",

        /* ---------- ghost ---------- */
        ghost:
          "bg-transparent text-[color:var(--foreground)] " +
          "hover:bg-[color:var(--sidebar-accent)] hover:text-[color:var(--sidebar-accent-foreground)]",

        /* ---------- красная destructive ---------- */
        destructive:
          "bg-[color:var(--destructive)] text-white shadow-xs " +
          "hover:bg-[color:var(--destructive)/.90] focus-visible:ring-[color:var(--destructive)/.45]",

        /* ---------- бирюзовый success ---------- */
        success:
          "bg-[color:var(--chart-2)] text-white shadow-xs " +
          "hover:bg-[color:var(--chart-2)/.90]",

        /* ---------- soft — бледный фон ---------- */
        soft:
          "bg-[color:var(--primary)/.12] text-[color:var(--primary)] " +
          "hover:bg-[color:var(--primary)/.18]",

        /* ---------- градиент (оставляем анимацию background-position) ---------- */
        gradient:
          "relative z-0 text-white shadow-md overflow-hidden " +
          "before:absolute before:inset-0 before:-z-10 " +
          "before:bg-[linear-gradient(120deg,theme(colors.green.500),theme(colors.emerald.500),theme(colors.green.600))] " +
          "before:bg-[length:200%_200%] motion-safe:before:animate-[gradientShift_6s_ease_infinite]",

        /* ---------- как ссылка ---------- */
        link:
          "p-0 h-auto underline-offset-4 text-[color:var(--primary)] " +
          "hover:underline focus-visible:ring-0 focus-visible:border-transparent",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-9 px-4 text-sm", // default
        lg: "h-10 px-5 text-base",
        xl: "h-12 px-6 text-base",
        icon: "size-9",
      },
      glow: {
        true:
          "relative after:absolute after:inset-0 after:rounded-[inherit] " +
          "after:border after:border-[color:var(--primary)] after:opacity-40 " +
          "motion-safe:after:animate-[pulse_2s_ease-in-out_infinite]",
      },
    },
    defaultVariants: { variant: "primary", size: "md", glow: false },
  },
);

/* ---------- keyframes (добавляем один раз) ---------- */
if (typeof document !== "undefined" && !document.getElementById("__btn_kf")) {
  const kf = document.createElement("style");
  kf.id = "__btn_kf";
  kf.innerHTML = `
@keyframes gradientShift {
  0%   { background-position:0% 50% }
  50%  { background-position:100% 50% }
  100% { background-position:0% 50% }
}
@keyframes pulse {
  0%,100% { opacity:.4; box-shadow:0 0 0 0 var(--primary) }
  50%     { opacity:0;   box-shadow:0 0 0 .4rem var(--primary) }
}`;
  document.head.appendChild(kf);
}

/* ---------- компонент Button ---------- */
export function Button({
  asChild,
  variant,
  size,
  glow,
  className,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp: any = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, glow, className }))}
      {...props}
    />
  );
}
