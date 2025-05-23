/* ------------------------------------------------------------------
   Трейдер — нижняя мобильная навигация
------------------------------------------------------------------ */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  ArrowLeftRight,
  Upload,
  Download,
  Banknote,
  ReceiptText,
  MoreHorizontal,
  Sun,
  Moon,
  LogOut,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { useMounted } from "@/hooks/useMounted";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useUser } from "@/hooks/useUser";

/* ---------- курс USDT/RUB (mocks) ---------- */
const rate = { buy: 93.5, sell: 92.8 };

/* ---------- тип пункта ---------- */
type NavItem =
  | { title: string; href: string; icon: React.ReactNode }
  | { title: string; action: () => void; icon: React.ReactNode };

/* ---------- основные 3 + ещё ---------- */
const primary: NavItem[] = [
  {
    title: "Транзакции",
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
];

export function MobileNav() {
  const mounted = useMounted();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAdminAuth();
  const { user } = useUser();

  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  /* motion */
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const [sheetH, setH] = useState(0);

  useEffect(() => {
    if (sheetRef.current) {
      setH(sheetRef.current.offsetHeight);
      y.set(sheetRef.current.offsetHeight);
      setReady(true);
    }
  }, [mounted]);

  const backdropOpacity = useTransform(y, [sheetH, 0], [0, 1]);

  /* анимации */
  const springTo = (v: number) =>
    animate(y, v, { type: "spring", stiffness: 300, damping: 34 });
  const snapOpen = () => {
    springTo(0);
    setOpen(true);
  };
  const snapClose = () => {
    springTo(sheetH);
    setOpen(false);
  };

  /* меню «Ещё» (memo зависит от theme) */
  const extra: NavItem[] = useMemo(
    () => [
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
      {
        title: theme === "dark" ? "Светлая тема" : "Тёмная тема",
        action: () => {
          toggleTheme();
          snapClose();
        },
        icon:
          theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          ),
      },
      {
        title: "Выход",
        action: () => logout(),
        icon: <LogOut className="h-5 w-5" />,
      },
    ],
    [theme],
  );

  if (!isMobile) return null;

  /* helper рисования пункта */
  const Item = ({ item }: { item: NavItem }) => {
    const active = "href" in item && pathname === item.href;
    const iconCls = cn("h-6 w-6", active && "text-green-500");
    const labelCls = cn("text-xs", active && "text-green-500");

    return "href" in item ? (
      <Link href={item.href} className="flex flex-col items-center gap-1">
        {React.cloneElement(item.icon as React.ReactElement, {
          className: iconCls,
        })}
        <span className={labelCls}>{item.title}</span>
      </Link>
    ) : (
      <button
        onClick={item.action}
        className="flex flex-col items-center gap-1"
      >
        {React.cloneElement(item.icon as React.ReactElement, {
          className: iconCls,
        })}
        <span className={labelCls}>{item.title}</span>
      </button>
    );
  };

  const extraActive = extra.some((i) => "href" in i && pathname === i.href);

  /* drag bar */
  let startY = 0;
  const onStart = () => (startY = y.get());
  const onDrag = (_: any, info: PanInfo) =>
    y.set(Math.min(sheetH, Math.max(0, startY + info.delta.y)));
  const onEnd = (_: any, info: PanInfo) =>
    info.offset.y < -sheetH / 2 ? snapOpen() : snapClose();

  const barDragProps =
    mounted && ready
      ? {
          drag: "y" as const,
          dragElastic: 0,
          dragConstraints: { top: 0, bottom: 0 },
          onDragStart: onStart,
          onDrag: onDrag,
          onDragEnd: onEnd,
        }
      : { drag: false };

  const sheetDragProps =
    mounted && ready && open
      ? {
          drag: "y" as const,
          dragElastic: 0,
          dragConstraints: { top: 0, bottom: sheetH },
          onDragEnd: (_: any, info: PanInfo) =>
            info.offset.y > sheetH / 2 ? snapClose() : snapOpen(),
        }
      : { drag: false };

  /* ---------- UI ---------- */
  const balanceUsdt = user?.balanceUsdt ?? 0;
  const balanceRub = (balanceUsdt * rate.sell).toFixed(0);

  return (
    <>
      {/* нижний бар */}
      <motion.nav
        {...barDragProps}
        onTap={snapOpen}
        className="fixed bottom-0 inset-x-0 z-40 px-2 pb-2 touch-none"
      >
        <div className="bg-card border rounded-t-3xl shadow-lg flex justify-around py-2">
          {primary.map((i) => (
            <Item key={"href" in i ? i.href : i.title} item={i} />
          ))}
          <button
            onClick={snapOpen}
            className="flex flex-col items-center gap-1 active:scale-95"
          >
            <MoreHorizontal
              className={cn("h-6 w-6", extraActive && "text-green-500")}
            />
            <span className={cn("text-xs", extraActive && "text-green-500")}>
              Ещё
            </span>
          </button>
        </div>
      </motion.nav>

      {/* backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/40"
            style={{ opacity: backdropOpacity }}
            onClick={snapClose}
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* карточка «доп. меню» */}
      <motion.div
        ref={sheetRef}
        style={{ y }}
        {...sheetDragProps}
        className="fixed bottom-0 inset-x-0 z-50 bg-card border-t rounded-t-2xl shadow-2xl p-4 touch-none"
      >
        <div className="flex justify-center mb-3">
          <span className="h-1.5 w-10 bg-muted rounded-full" />
        </div>

        <div className="flex justify-between">
          <h2 className="font-semibold text-lg">Доп. меню</h2>
          <button onClick={snapClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* user info */}
        <div className="mt-4 p-4 bg-muted/40 rounded-xl space-y-1">
          <p className="text-sm font-medium truncate">{user?.email ?? ""}</p>
          <p className="text-xs text-muted-foreground truncate">
            Баланс: {balanceUsdt.toFixed(2)} USDT / {balanceRub} ₽
          </p>
          <p className="text-xs text-muted-foreground truncate">
            USDT/RUB: {rate.buy} / {rate.sell}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {extra.map((i) => (
            <Item key={"href" in i ? i.href : i.title} item={i} />
          ))}
        </div>
      </motion.div>
    </>
  );
}
