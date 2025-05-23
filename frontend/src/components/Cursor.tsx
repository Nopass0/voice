"use client";
import * as React from "react";

type Variant = "default" | "pointer" | "text";

export default function Cursor() {
  const dot = React.useRef<HTMLDivElement>(null);
  const [{ x, y }, setPos] = React.useState({ x: -100, y: -100 });
  const [variant, setVariant] = React.useState<Variant>("default");

  /* shared helpers */
  const isPointer = (el: HTMLElement | null) =>
    !!el?.closest("a,button,[role='button'],[data-cursor='pointer']");
  const isText = (el: HTMLElement | null) =>
    !!el?.closest(
      "input[type='text'],textarea,[contenteditable=true],[data-cursor='text']",
    );

  /* move + decide variant */
  React.useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const t = e.target as HTMLElement | null;
      setVariant(isPointer(t) ? "pointer" : isText(t) ? "text" : "default");
    };

    /* ripple on left-click */
    const ripple = (e: MouseEvent) => {
      if (e.button !== 0) return; // only LMB
      const r = document.createElement("span");
      r.className =
        "pointer-events-none fixed rounded-full bg-primary opacity-40";
      const size = 10;
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${e.clientX - size / 2}px`;
      r.style.top = `${e.clientY - size / 2}px`;
      r.style.transform = "scale(1)";
      r.style.transition = "transform .6s ease-out, opacity .6s";
      document.body.appendChild(r);
      requestAnimationFrame(() => {
        r.style.transform = "scale(20)";
        r.style.opacity = "0";
      });
      r.addEventListener("transitionend", () => r.remove());
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", ripple);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", ripple);
    };
  }, []);

  /* style dictionaries */
  const base: React.CSSProperties = {
    position: "fixed",
    left: x,
    top: y,
    transform: "translate(-50%,-50%)",
    transition: "width .18s,height .18s,border .18s,background .18s",
    pointerEvents: "none",
    zIndex: 9999,
    mixBlendMode: "difference",
  };

  const styles: Record<Variant, React.CSSProperties> = {
    default: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "var(--primary)",
    },
    pointer: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: "2px solid var(--primary)",
      background: "var(--primary)",
    },
    text: {
      width: 2,
      height: 28,
      background: "var(--primary)",
      animation: "caretBlink 1s steps(2) infinite",
    },
  };

  return <div ref={dot} style={{ ...base, ...styles[variant] }} />;
}

/* keyframes один раз */
if (typeof document !== "undefined" && !document.getElementById("__cursorKF")) {
  const s = document.createElement("style");
  s.id = "__cursorKF";
  s.innerHTML = `@keyframes caretBlink{0%,49%{opacity:1}50%,100%{opacity:.2}}`;
  document.head.appendChild(s);
}
