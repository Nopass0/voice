/* ------------------------------------------------------------------
   Модалка: QR-код реквизита (с полем ввода для копирования ID)
------------------------------------------------------------------ */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { QRCode } from "react-qrcode-logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/api/base";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  requisiteId: string | null;
}

// Функция для проверки статуса подключения устройства
const checkDeviceConnection = async (requisiteId: string) => {
  try {
    const response = await api.get(`/api/trader/bank-details/${requisiteId}`);
    return response.data?.hasDevice || false;
  } catch (error) {
    console.error("Ошибка при проверке статуса устройства:", error);
    return false;
  }
};

export default function RequisiteQRModal({
  open,
  onOpenChange,
  requisiteId,
}: Props) {
  const { theme } = useTheme();
  const qrColor = theme === "dark" ? "#FFFFFF" : "currentColor";
  const queryClient = useQueryClient();

  // State для копирования и проверки подключения
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    if (!requisiteId) return;
    navigator.clipboard.writeText(requisiteId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Эффект для проверки подключения устройства при открытии модалки
  useEffect(() => {
    if (open && requisiteId && !isConnected) {
      setIsChecking(true);

      // Начать опрос
      intervalRef.current = setInterval(async () => {
        const connected = await checkDeviceConnection(requisiteId);

        if (connected) {
          // Устройство подключено
          setIsConnected(true);
          setShowSuccess(true);
          setIsChecking(false);

          // Обновить данные в таблице через React Query
          queryClient.invalidateQueries({ queryKey: ["bank-details"] });

          // Задержка перед закрытием модального окна
          setTimeout(() => {
            onOpenChange(false);
            // Сбрасываем состояние после закрытия
            setTimeout(() => {
              setIsConnected(false);
              setShowSuccess(false);
            }, 500);
          }, 1500);

          // Очистить интервал
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 3000); // Проверка каждые 3 секунды
    }

    // Очистка при закрытии
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, requisiteId, isConnected, onOpenChange, queryClient]);

  if (!requisiteId) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => {
      // Сбрасываем состояние при закрытии
      if (!value) {
        setIsConnected(false);
        setShowSuccess(false);
      }
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            QR-код реквизита
          </DialogTitle>
        </DialogHeader>

        {/* Поле для копирования ID */}
        <div className="flex gap-2 items-center">
          <Input
            value={requisiteId}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* QR-код */}
        <div className="flex justify-center my-6 relative">
          {/* Анимация успешного подключения */}
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-xl animate-in fade-in zoom-in duration-300">
              <div className="rounded-full bg-green-100 dark:bg-green-900/40 p-3">
                <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
          )}

          {/* Индикатор проверки подключения */}
          {isChecking && !showSuccess && (
            <div className="absolute top-1 right-1 z-10">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
          )}

          <QRCode
            value={requisiteId}
            size={200}
            qrStyle="dots"
            eyeRadius={8}
            bgColor="transparent"
            fgColor={qrColor}
            className="rounded-xl"
          />
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
