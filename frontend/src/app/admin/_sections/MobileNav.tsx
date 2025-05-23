// voice/src/app/admin/_sections/MobileNav.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import {
  Handshake,
  TrendingUp,
  Users,
  Tag,
  ArrowLeftRight,
  ReceiptText,
  Layers,
  Store,
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

/** ---------- тип пункта меню ---------- */
type NavItem =
  | { title: string; href: string; icon: React.ReactNode }
  | { title: string; action: () => void; icon: React.ReactNode };

/** ---------- четыре основных пункта ---------- */
const primary: NavItem[] = [
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
];

export function MobileNav() {
  /* -------- базовые хуки (порядок фиксирован — нельзя менять!) -------- */
  const mounted = useMounted(); // 1  (false во время SSR)
  const isMobile = useMediaQuery("(max-width: 767px)"); // 2
  const pathname = usePathname(); // 3
  const { theme, toggleTheme } = useTheme(); // 4

  const [open, setOpen] = useState(false); // 5
  const [sheetReady, setReady] = useState(false); // 6

  /* refs / motion values */
  const sheetRef = useRef<HTMLDivElement>(null); // 7
  const y = useMotionValue(0); // 8
  const { logout } = useAdminAuth();

  /* высота карточки */
  const [sheetH, setSheetH] = useState(0); // 9
  useEffect(() => {
    if (sheetRef.current) {
      const h = sheetRef.current.offsetHeight;
      setSheetH(h);
      y.set(h); // карточка спрятана внизу при первом paint
      setReady(true); // можем безопасно давать drag-props
    }
  }, [mounted]); // 10

  /* backdrop opacity (0 → спрятано, 1 → открыто) */
  const backdropOpacity = useTransform(y, [sheetH, 0], [0, 1]); // 11

  /* пружинка до нужного состояния */
  const springTo = (val: number) =>
    animate(y, val, { type: "spring", stiffness: 300, damping: 34 });

  const snapOpen = () => {
    springTo(0);
    setOpen(true);
  };
  const snapClosed = () => {
    springTo(sheetH);
    setOpen(false);
  };

  /* -------- доп-меню – пересчитывается, когда меняется тема -------- */
  const extra: NavItem[] = useMemo(
    () => [
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
      {
        title: theme === "dark" ? "Светлая тема" : "Тёмная тема",
        action: () => {
          toggleTheme();
          snapClosed();
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
        action: () => {
          logout;
        },
        icon: <LogOut className="h-5 w-5" />,
      },
    ],
    [theme, toggleTheme],
  );

  /* -------- не отображаем DOM, если ширина > mobile, но хуки вызваны -------- */
  if (!isMobile) return null;

  /* -------- helper отрисовки пункта -------- */
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

  /* -------- drag для бара -------- */
  let startY = 0;
  const onBarDragStart = () => {
    startY = y.get();
  };
  const onBarDrag = (_: any, info: PanInfo) => {
    const next = Math.min(sheetH, Math.max(0, startY + info.delta.y));
    y.set(next);
  };
  const onBarDragEnd = (_: any, info: PanInfo) => {
    info.offset.y < -sheetH / 2 ? snapOpen() : snapClosed();
  };

  /* -------- drag для карточки -------- */
  const onSheetDragEnd = (_: any, info: PanInfo) => {
    info.offset.y > sheetH / 2 ? snapClosed() : snapOpen();
  };

  /* -------- условные drag-props, чтобы не было addEventListener error -------- */
  const barDragProps =
    mounted && sheetReady
      ? {
          drag: "y" as const,
          dragElastic: 0,
          dragConstraints: { top: 0, bottom: 0 },
          onDragStart: onBarDragStart,
          onDrag: onBarDrag,
          onDragEnd: onBarDragEnd,
        }
      : { drag: false };

  const sheetDragProps =
    mounted && sheetReady && open
      ? {
          drag: "y" as const,
          dragElastic: 0,
          dragConstraints: { top: 0, bottom: sheetH },
          onDragEnd: onSheetDragEnd,
        }
      : { drag: false };

  /* -------- UI -------- */
  return (
    <>
      {/* ===== нижний бар – рукоятка ===== */}
      <motion.nav
        {...barDragProps}
        onTap={snapOpen}
        className="fixed bottom-0 inset-x-0 z-40 px-2 pb-2 touch-none"
      >
        <div className="bg-card border rounded-t-3xl shadow-lg flex justify-around py-2">
          {primary.map((i) => (
            <Item key={"href" in i ? i.href : i.title} item={i} />
          ))}

          {/* — кнопка «Ещё» с подписью — */}
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

      {/* ===== backdrop ===== */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/40"
            style={{ opacity: backdropOpacity }}
            onClick={snapClosed}
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ===== карточка ===== */}
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
          <button onClick={snapClosed}>
            <X className="h-5 w-5" />
          </button>
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
