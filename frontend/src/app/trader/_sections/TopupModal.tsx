/* ------------------------------------------------------------------
   Модалка пополнения баланса USDT (TRC-20) — финальный UI
------------------------------------------------------------------ */
"use client";

import React, { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useTheme } from "@/hooks/useTheme"; // ← для смены цвета QR

const TOPUP_ADDRESS = "TAfYiMZzP5XR1T6qCy3oXNkU4sfmAbC9qw";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const Logo = () => (
  <span className="italic font-extrabold leading-none animate-glitch select-none text-3xl">
    CHA<span className="text-green-500">$</span>E
  </span>
);

export default function TopupModal({ open, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme(); // ← текущая тема

  const copy = () => {
    navigator.clipboard.writeText(TOPUP_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  /* QR-код: белый в тёмной теме, иначе — цвет текста */
  const qrColor = theme === "dark" ? "#FFFFFF" : "currentColor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex justify-center">
            <Logo />
          </div>

          <DialogTitle className="text-xl font-bold text-center">
            Пополнение баланса
          </DialogTitle>

          <DialogDescription className="text-sm text-center">
            Отправьте USDT (TRC-20) на адрес ниже. Зачисляем после
            <b className="mx-1">1 подтверждения</b> сети.
          </DialogDescription>
        </DialogHeader>

        {/* адрес + копировать */}
        <div className="flex items-center gap-2 mt-6">
          <Input
            readOnly
            value={TOPUP_ADDRESS}
            className="h-9 px-3 py-1 text-sm font-mono select-all
                       border-none   outline-none rounded-md bg-background"
          />
          <Button
            onClick={copy}
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* QR-код */}
        <div className="flex justify-center my-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/10">
            <QRCode
              value={TOPUP_ADDRESS}
              size={180}
              qrStyle="dots"
              eyeRadius={8}
              bgColor="transparent"
              fgColor={qrColor}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* предупреждение */}
        <div className="border rounded-xl p-4 bg-muted/30 text-sm leading-tight">
          Переводы принимаются <b>только</b> в сети
          <span className="font-semibold text-green-600"> TRC-20</span>.
          Средства, отправленные по другим сетям, будут безвозвратно утеряны.
        </div>

        <DialogFooter className="mt-6">
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
