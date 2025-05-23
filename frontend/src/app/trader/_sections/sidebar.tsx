/* ------------------------------------------------------------------
   Трейдер — десктоп-sidebar (иконки курсов и баланса + кнопка Пополнить)
------------------------------------------------------------------ */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Upload,
  Download,
  Banknote,
  ReceiptText,
  ChevronLeft,
  Sun,
  Moon,
  LogOut,
  User2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useMounted } from "@/hooks/useMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useUser } from "@/hooks/useUser";

import TopupModal from "./TopupModal";

/* ---------- навигационные пункты ---------- */
type Item = { title: string; href: string; icon: React.ReactNode };

const items: Item[] = [
  {
    title: "Все транзакции",
    href: "/trader/transactions",
    icon: <ArrowLeftRight className="h-5 w-5" />,
  },
  {
    title: "Пополнения",
    href: "/trader/topups",
    icon: <Upload className="h-5 w-5" />,
  },
  {
    title: "Выплаты",
    href: "/trader/payouts",
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: "Депозит",
    href: "/trader/deposit",
    icon: <Banknote className="h-5 w-5" />,
  },
  {
    title: "Реквизиты",
    href: "/trader/requisites",
    icon: <ReceiptText className="h-5 w-5" />,
  },
];

/* ---------- временный курс USDT/RUB (mocks) ---------- */
const rate = { buy: 93.5, sell: 92.8 };

export function Sidebar() {
  const mounted = useMounted();
  const desktop = useMediaQuery("(min-width: 768px)");
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false); // <- новое состояние
  const { logout } = useAdminAuth();
  const { user } = useUser();

  if (!desktop) return null;

  const balanceUsdt = user?.balanceUsdt ?? 0;
  const balanceRub = (balanceUsdt * rate.sell).toFixed(0);

  /** Статистика курса и баланса (вид для open / collapsed) */
  const Stats = () =>
    open ? (
      <div className="grid grid-cols-3 gap-4 mt-4 select-none px-1">
        <div className="flex flex-col items-center">
          <Upload className="h-4 w-4 text-green-500" />
          <span className="text-xs leading-none mt-0.5">{rate.sell}</span>
        </div>
        <div className="flex flex-col items-center">
          <Download className="h-4 w-4 text-red-500" />
          <span className="text-xs leading-none mt-0.5">{rate.buy}</span>
        </div>
        <div className="flex flex-col items-center">
          <Banknote className="h-4 w-4" />
          <span className="text-xs leading-none mt-0.5">{balanceRub}₽</span>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-4 mt-4 select-none">
        <div className="flex flex-col items-center">
          <Upload className="h-5 w-5 text-green-500" />
          <span className="text-[10px] leading-none">{rate.sell}</span>
        </div>
        <div className="flex flex-col items-center">
          <Download className="h-5 w-5 text-red-500" />
          <span className="text-[10px] leading-none">{rate.buy}</span>
        </div>
        <div className="flex flex-col items-center">
          <Banknote className="h-5 w-5" />
          <span className="text-[10px] leading-none">{balanceRub}₽</span>
        </div>
      </div>
    );

  /* ---------- логотипы ---------- */
  const logoFull = (
    <span className="italic font-extrabold leading-none animate-glitch select-none">
      CHA<span className="text-green-500">$</span>E
    </span>
  );
  const logoMini = (
    <span className="text-green-500 text-xl font-extrabold leading-none animate-glitch select-none">
      $
    </span>
  );

  return (
    <motion.aside
      animate={{ width: open ? 240 : 70 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "fixed top-0 left-0 z-10 h-screen bg-card border-r flex flex-col overflow-x-hidden",
        open ? "px-4" : "px-0 rounded-r-3xl shadow-lg",
      )}
    >
      {/* Логотип */}
      <div className="flex items-center py-6">
        <button
          onClick={() => setOpen(!open)}
          className={open ? "text-2xl" : "mx-auto"}
        >
          {open ? logoFull : logoMini}
        </button>
        {open && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="ml-auto"
          >
            <ChevronLeft />
          </Button>
        )}
      </div>

      {/* Навигация + статистика + кнопка Пополнить */}
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <nav className="flex flex-col gap-1">
          <TooltipProvider delayDuration={0}>
            {items.map((i) => {
              const active = pathname === i.href;
              return (
                <Tooltip key={i.href}>
                  <TooltipTrigger asChild>
                    <Link href={i.href} legacyBehavior>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "h-12 mx-1 rounded-lg w-full cursor-pointer transition-all",
                          open ? "justify-start px-4" : "justify-center px-0",
                        )}
                      >
                        {i.icon}
                        <AnimatePresence>
                          {open && (
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
                  {!open && (
                    <TooltipContent side="right">{i.title}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>

        {/* Курсы и баланс */}
        <Stats />

        {/* Кнопка «Пополнить» */}
        <div className="mt-4">
          {open ? (
            <Button
              variant="gradient"
              className="w-full"
              onClick={() => setDepositOpen(true)}
            >
              <Banknote className="h-4 w-4 mr-2" />
              Пополнить
            </Button>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="gradient"
                    className="mx-4"
                    onClick={() => setDepositOpen(true)}
                  >
                    <Banknote className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Пополнить</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Информация о пользователе, переключатель темы, выход */}
      <div className="border-t py-4 flex flex-col gap-2">
        {/* user info */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "h-12 mx-1 rounded-lg w-full flex items-center select-none",
                  open ? "justify-start px-4" : "justify-center px-0",
                )}
              >
                <User2 className="h-5 w-5" />
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 overflow-hidden"
                    >
                      <p className="text-sm font-medium truncate">
                        {user?.email ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Баланс: {balanceUsdt.toFixed(2)} USDT / {balanceRub} ₽
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        USDT/RUB: {rate.buy} / {rate.sell}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TooltipTrigger>
            {!open && (
              <TooltipContent side="right" className="space-y-0.5">
                <p className="text-sm font-medium truncate">
                  {user?.email ?? ""}
                </p>
                <p className="text-xs">Баланс: {balanceUsdt.toFixed(2)} USDT</p>
                <p className="text-xs">
                  USDT/RUB: {rate.buy}/{rate.sell}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* theme toggle */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                  "h-12 mx-1 rounded-lg w-full transition-all",
                  open ? "justify-start px-4" : "justify-center px-0",
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
                <AnimatePresence>
                  {open && mounted && (
                    <motion.span
                      key={theme}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3"
                    >
                      {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {!open && (
              <TooltipContent side="right">
                {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* logout */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={logout}
                className={cn(
                  "h-12 mx-1 rounded-lg w-full transition-all",
                  open ? "justify-start px-4" : "justify-center px-0",
                )}
              >
                <LogOut className="h-5 w-5" />
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3"
                    >
                      Выход
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {!open && <TooltipContent side="right">Выход</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Модальное окно пополнения */}
      <TopupModal open={depositOpen} onOpenChange={setDepositOpen} />
    </motion.aside>
  );
}
