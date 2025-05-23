"use client";

import * as React from "react";
import * as CM from "@radix-ui/react-context-menu";
import { toast } from "sonner";

const GAP = 8; // минимальный отступ от краёв
const W = 192; // width: w-48
const H = 208; // примерная высота

export default function GlobalContextMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const target = React.useRef<EventTarget | null>(null);

  /* ——— helpers ——— */
  const isInput = () =>
    (target.current as HTMLElement | null)?.matches(
      "input,textarea,[contenteditable=true]",
    ) ?? false;

  const copy = () => {
    const txt = window.getSelection()?.toString();
    if (txt) navigator.clipboard.writeText(txt);
  };
  const paste = async () => {
    const txt = await navigator.clipboard.readText();
    const el = target.current as HTMLInputElement | HTMLTextAreaElement;
    if (el && "value" in el) {
      const p = el.selectionStart ?? 0;
      el.setRangeText(txt, p, p, "end");
    }
  };

  /* ——— показать меню ——— */
  React.useEffect(() => {
    const show = (e: MouseEvent) => {
      if (e.button !== 2) return;
      e.preventDefault();
      target.current = e.target;
      const { innerWidth: vw, innerHeight: vh } = window;
      let x = e.clientX + GAP;
      let y = e.clientY + GAP;
      if (x + W > vw) x = e.clientX - W - GAP;
      if (y + H > vh) y = e.clientY - H - GAP;
      if (x < GAP) x = GAP;
      if (y < GAP) y = GAP;
      setPos({ x, y });
      setOpen(true);
    };
    const hideClick = (e: MouseEvent) => e.button === 0 && setOpen(false);
    const hideEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    window.addEventListener("contextmenu", show);
    window.addEventListener("mousedown", hideClick);
    window.addEventListener("keyup", hideEsc);
    return () => {
      window.removeEventListener("contextmenu", show);
      window.removeEventListener("mousedown", hideClick);
      window.removeEventListener("keyup", hideEsc);
    };
  }, []);

  /* ——— render ——— */
  return (
    <>
      {children}

      <CM.Root open={open} onOpenChange={setOpen}>
        {/* фиктивный Trigger — обязателен Radix-у  */}
        <CM.Trigger asChild>
          <span />
        </CM.Trigger>

        <CM.Portal>
          <CM.Content
            align="start"
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
              transformOrigin: "top left",
              animation: open ? "cmPop .18s ease-out" : undefined,
            }}
            className="w-48 rounded-md border shadow-xl bg-card text-card-foreground"
          >
            <CM.Item onSelect={() => toast("Вкладка 1")}>Вкладка 1</CM.Item>
            <CM.Item onSelect={() => toast("Опция 2")}>Опция 2</CM.Item>

            {isInput() && (
              <>
                <CM.Separator />
                <CM.Item onSelect={copy}>Копировать</CM.Item>
                <CM.Item onSelect={paste}>Вставить</CM.Item>
              </>
            )}

            <CM.Separator />
            <CM.Item
              onSelect={() => toast.info("Откройте DevTools — F12 / ⌥⌘ I")}
            >
              Инструменты разработчика
            </CM.Item>
          </CM.Content>
        </CM.Portal>
      </CM.Root>
    </>
  );
}

/* ---------- анимация ---------- */
if (typeof document !== "undefined" && !document.getElementById("__cmKF")) {
  const st = document.createElement("style");
  st.id = "__cmKF";
  st.textContent =
    "@keyframes cmPop{0%{opacity:0;transform:scale(.85)}100%{opacity:1;transform:scale(1)}}";
  document.head.appendChild(st);
}
