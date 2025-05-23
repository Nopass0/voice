"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="mb-8 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-extrabold italic animate-glitch select-none"
          >
            CHA<span className="text-green-500">$</span>E
          </motion.span>
        </div>
      </main>
    </div>
  );
}
