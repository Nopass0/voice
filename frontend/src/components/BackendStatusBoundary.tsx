"use client";

import { PropsWithChildren } from "react";
import { useServerInfo } from "@/hooks/useServerInfo";

/** Покрывает всё приложение «плашкой», если API недоступно */
export default function BackendStatusBoundary({ children }: PropsWithChildren) {
  const { error, isLoading } = useServerInfo();

  // Пока идёт первая проверка — просто рендерим children (можно вывести спиннер)
  if (isLoading) return children;

  // Если сервер упал → показываем плашку на весь экран
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground gap-2">
        <h1 className="text-2xl font-semibold">🚧 Технические работы</h1>
        <p className="opacity-80">
          Сервер временно недоступен, попробуйте зайти позднее
        </p>
      </div>
    );
  }

  // Всё ок — пропускаем приложение
  return children;
}
