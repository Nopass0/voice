"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Sun, Moon, Loader2 } from "lucide-react";

import { useTraderAuth } from "@/hooks/useTraderAuth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Страница /trader/auth — авторизация по email + password.
 * При успешном логине создаётся сессия, token сохраняется в zustand + cookies + LS,
 * после чего пользователь перенаправляется на /trader/dashboard.
 */
export default function TraderAuthPage() {
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* Хук авторизации */
  const { login } = useTraderAuth();

  /* Переключатель темы (класс .dark на <html>) */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  /* Submit формы */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login.isPending) return; // защита от повторной отправки

    login.mutate({ email, password });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Переключатель темы */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsDark((d) => !d)}
        className="fixed top-4 right-4 z-20"
        aria-label="Переключить тему"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Центрированная карточка */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 180,
            damping: 20,
          }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-extrabold italic animate-glitch select-none"
            >
              CHA<span className="text-green-500">$</span>E
            </motion.span>
          </div>

          <Card className="shadow-xl border border-[color:var(--sidebar-border)] backdrop-blur-sm/40">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{
                    delay: 0.25,
                    type: "spring",
                    stiffness: 250,
                    damping: 18,
                  }}
                  className="p-3 rounded-full bg-[color:var(--primary)/.12] text-[color:var(--primary)]"
                >
                  <Lock className="h-6 w-6" />
                </motion.div>
              </div>
              <CardTitle className="text-2xl text-center">
                Вход в систему
              </CardTitle>
              <CardDescription className="text-center">
                Введите e-mail и пароль, чтобы продолжить
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={submit} className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={login.isPending}
                >
                  {login.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Войти
                </Button>

                {login.isError && (
                  <p className="text-sm text-destructive text-center">
                    {login.error?.message ||
                      "Не удалось войти. Попробуйте ещё раз."}
                  </p>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              Убедитесь, что вы вводите корректные данные.
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
