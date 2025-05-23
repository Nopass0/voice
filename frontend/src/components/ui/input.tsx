// src/components/ui/Input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Унифицированный инпут:
 * – h-12, одинаковый радиус с кнопками/пунктами сайдбара
 * – собственный зелёный ring-эффект (`--sidebar-ring`)
 * – браузерный белый outline полностью отключён
 */
export function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      type={type}
      data-slot="input"
      className={cn(
        /* базовые */
        "flex h-12 w-full rounded-lg border bg-transparent px-3 py-2 text-base shadow-xs",
        "placeholder:text-muted-foreground file:text-foreground",
        "disabled:pointer-events-none disabled:opacity-50",

        /* цвета/бордеры в стиле сайдбара */
        "border-[color:var(--color-sidebar-border)] dark:bg-input/30",

        /* custom ring + убираем дефолтный outline */
        "focus-visible:border-[color:var(--color-sidebar-ring)]",
        "focus-visible:ring-[3px] focus-visible:ring-[color:var(--color-sidebar-ring)/0.55]",
        "outline-none focus:outline-none focus-visible:outline-none",

        /* ошибка валидации */
        "aria-invalid:border-destructive aria-invalid:ring-destructive/50",

        className,
      )}
    />
  );
}
