// voice/src/app/trader/layout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "./_sections/sidebar";
import { MobileNav } from "./_sections/MobileNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isAuthPage = pathname === "/trader/auth";

  return (
    <div className="bg-background min-h-screen">
      {/* --- Навигация (прячем на странице авторизации) --- */}
      {!isAuthPage && (
        <>
          {!isAuthPage && isDesktop && <Sidebar />}
          {!isAuthPage && !isDesktop && <MobileNav />}
        </>
      )}

      {/* --- Контент --- */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={
          isAuthPage
            ? "min-h-screen flex items-center justify-center"
            : "p-6 transition-all duration-300 ml-0 md:ml-[70px] lg:ml-[240px]"
        }
      >
        {children}
      </motion.main>
    </div>
  );
}
