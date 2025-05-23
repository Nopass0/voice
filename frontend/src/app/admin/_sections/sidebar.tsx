// voice/src/app/admin/_sections/Sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Handshake,
  TrendingUp,
  Users,
  Tag,
  ArrowLeftRight,
  ReceiptText,
  Layers,
  Store,
  ChevronLeft,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useMounted } from "@/hooks/useMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAdminAuth } from "@/hooks/useAdminAuth";

type Item = { title: string; href: string; icon: React.ReactNode };

const items: Item[] = [
  {
    title: "Трейдеры",
    href: "/admin/traders",
    icon: <Handshake className="h-5 w-5" />,
  },
  {
    title: "Выручка",
    href: "/admin/revenue",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  { title: "Офферы", href: "/admin/offers", icon: <Tag className="h-5 w-5" /> },
  {
    title: "Транзакции",
    href: "/admin/transactions",
    icon: <ArrowLeftRight className="h-5 w-5" />,
  },
  {
    title: "Реквизиты",
    href: "/admin/requisites",
    icon: <ReceiptText className="h-5 w-5" />,
  },
  {
    title: "Методы",
    href: "/admin/methods",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: "Мерчанты",
    href: "/admin/merchants",
    icon: <Store className="h-5 w-5" />,
  },
];

export function Sidebar() {
  /* -------- hooks (порядок не меняем) -------- */
  const mounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const { logout } = useAdminAuth();

  /* не монтируем на мобилке вовсе */
  if (!isDesktop) return null;

  /* -------- логотипы -------- */
  const logoFull = (
    <span className="italic font-extrabold leading-none animate-glitch cursor-pointer select-none">
      VOI<span className="text-green-500">$</span>CE
    </span>
  );

  const logoMini = (
    <span className="text-green-500 text-xl font-extrabold leading-none animate-glitch cursor-pointer select-none">
      $
    </span>
  );

  /* -------- UI -------- */
  return (
    <motion.aside
      animate={{ width: expanded ? 240 : 70 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "fixed top-0 left-0 z-10 h-screen bg-card border-r flex flex-col",
        expanded ? "px-4" : "px-0 rounded-r-3xl shadow-lg",
      )}
    >
      {/* ---------- ЛОГО + стрелка ---------- */}
      <div className="flex items-center py-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(expanded ? "text-2xl" : "mx-auto")}
        >
          {expanded ? logoFull : logoMini}
        </button>

        {expanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(false)}
            className="ml-auto rounded-full cursor-pointer"
          >
            <ChevronLeft />
          </Button>
        )}
      </div>

      {/* ---------- Навигация ---------- */}
      <div className="flex-1 py-4">
        <nav className="flex flex-col gap-1">
          <TooltipProvider delayDuration={0}>
            {items.map((i) => {
              const active = pathname === i.href;
              return (
                <Tooltip key={i.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={i.href} legacyBehavior>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "h-12 mx-1 rounded-lg w-full transition-all cursor-pointer",
                          expanded
                            ? "justify-start px-4"
                            : "justify-center px-0",
                        )}
                      >
                        {i.icon}
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="ml-3 overflow-hidden whitespace-nowrap"
                            >
                              {i.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {!expanded && (
                    <TooltipContent side="right">{i.title}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>

      {/* ---------- Тема + выход ---------- */}
      <div className="border-t py-4 flex flex-col gap-2">
        {/* Переключатель темы */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                  "h-12 mx-1 rounded-lg w-full flex items-center transition-all cursor-pointer",
                  expanded ? "justify-start px-4" : "justify-center px-0",
                )}
              >
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )
                ) : (
                  <div className="h-5 w-5" />
                )}

                <AnimatePresence initial={false}>
                  {expanded && mounted && (
                    <motion.span
                      key={theme}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 overflow-hidden whitespace-nowrap"
                    >
                      {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right">
                {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Выход */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={logout}
                className={cn(
                  "h-12 mx-1 rounded-lg w-full flex items-center transition-all cursor-pointer",
                  expanded ? "justify-start px-4" : "justify-center px-0",
                )}
              >
                <LogOut className="h-5 w-5" />
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 overflow-hidden whitespace-nowrap"
                    >
                      Выход
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {!expanded && <TooltipContent side="right">Выход</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.aside>
  );
}
