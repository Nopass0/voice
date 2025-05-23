import type { Config } from "tailwindcss";

// ⚠️  Перезапустите dev-сервер после правки конфига
export default {
  content: ["./src/**/*.{ts,tsx}"], // ваши пути
  theme: {
    extend: {
      colors: {
        /* даст утилиты bg-card / text-card / border-card и т. д. */
        card: "oklch(var(--card) / <alpha-value>)",
        "card-foreground": "oklch(var(--card-foreground) / <alpha-value>)",

        popover: "oklch(var(--card) / <alpha-value>)",
        "popover-foreground": "oklch(var(--card-foreground) / <alpha-value>)",
      },
    },
  },
} satisfies Config;
