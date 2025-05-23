"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Lock, Sun, Moon } from "lucide-react";
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
import { useTheme } from "@/hooks/useTheme";
import { useAdminAuth } from "@/hooks/useAdminAuth";

function AuthContent() {
  const [token, setToken] = useState("");
  const { login } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  /* если юзер уже вошёл и попал сюда вручную → отправим в /admin */
  React.useEffect(() => {
    const cookie = document.cookie.match(/(?:^|;) *x-admin-key=/);
    if (cookie) router.replace("/admin");
  }, [router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(token, {
      onSuccess: () => {
        const redirectTo = searchParams.get("redirect") ?? "/admin";
        toast.success("Авторизация успешна");
        router.replace(redirectTo);
      },
      onError: (err) => {
        toast.error(err.message ?? "Неверный токен");
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* переключатель темы */}
      <Button
        size="icon"
        variant="ghost"
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-20"
        aria-label="Переключить тему"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      {/* центрированная карточка */}
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
                Доступ администратора
              </CardTitle>
              <CardDescription className="text-center">
                Введите токен администратора, чтобы продолжить
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={submit} className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Токен доступа</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Введите токен"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  disabled={login.isPending}
                >
                  {login.isPending ? "Проверка…" : "Войти"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              Доступ разрешён только уполномоченным лицам.
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* toast-контейнер */}
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default function AdminAuth() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <AuthContent />
    </Suspense>
  );
}
