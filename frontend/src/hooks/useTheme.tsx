// src/hooks/useTheme.tsx
"use client";

import React, { useLayoutEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light"; // одинаково для SSR
  const persisted = localStorage.getItem("theme") as Theme | null;
  if (persisted) return persisted;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/* ----------  helper  ---------- */
const applyThemeToDOM = (t: Theme) =>
  document.documentElement.classList.toggle("dark", t === "dark");

/* ----------  store  ---------- */
export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      toggleTheme: () => {
        const newT = get().theme === "light" ? "dark" : "light";
        applyThemeToDOM(newT);
        set({ theme: newT });
      },
      setTheme: (t) => {
        applyThemeToDOM(t);
        set({ theme: t });
      },
    }),
    {
      name: "theme", // ключ в localStorage
    },
  ),
);

/* ----------  провайдер (опционален)  ---------- */
/* Если вы пользуетесь Next.js App Router и у вас нет общего <ThemeProvider>,
   просто импортируйте useTheme там, где надо.
   Но иногда полезна обёртка, чтобы можно было вызвать toggleTheme ещё до гидратации. */
export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // при первом рендере синхронно накидываем класс, чтобы избежать "мигания" темы
  useLayoutEffect(() => {
    applyThemeToDOM(useTheme.getState().theme);
  }, []);

  return <>{children}</>;
};
