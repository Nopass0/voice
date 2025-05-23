/* ------------------------------------------------------------------
   Модалка: информация о подключенном устройстве к реквизиту
------------------------------------------------------------------ */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BatteryCharging,
  Wifi,
  InfoIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Device } from "@/api/bankDetails";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  device: Device | null;
}

export default function BankDetailDeviceModal({
  open,
  onOpenChange,
  device,
}: Props) {
  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            Информация об устройстве
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Основная информация */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-medium text-lg">{device.name}</span>
              {device.isOnline ? (
                <span className="ml-2 text-green-600 flex items-center">
                  <span className="relative mr-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                    <span className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 opacity-60 animate-ping"></span>
                  </span>
                  онлайн
                </span>
              ) : (
                <span className="ml-2 text-red-500 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block mr-1"></span>
                  оффлайн
                </span>
              )}
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <BatteryCharging
                    className={`h-4 w-4 mr-1 ${
                      device.energy > 70 ? 'text-green-500' :
                      device.energy > 30 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}
                  />
                  Заряд
                </div>
                <div className={`text-xl font-semibold ${
                  device.energy > 70 ? 'text-green-500' :
                  device.energy > 30 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {device.energy}%
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Wifi
                    className={`h-4 w-4 mr-1 ${
                      device.ethernetSpeed > 5 ? 'text-blue-500' :
                      device.ethernetSpeed > 2 ? 'text-teal-500' :
                      'text-orange-500'
                    }`}
                  />
                  Интернет
                </div>
                <div className={`text-xl font-semibold ${
                  device.ethernetSpeed > 5 ? 'text-blue-500' :
                  device.ethernetSpeed > 2 ? 'text-teal-500' :
                  'text-orange-500'
                }`}>
                  {device.ethernetSpeed} Mbps
                </div>
              </div>
            </div>

            {/* Технические детали */}
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex justify-between py-1 border-b">
                <span>ID устройства:</span>
                <span className="font-mono">{device.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Дата создания:</span>
                <span>{new Date(device.createdAt).toLocaleString("ru-RU")}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Последнее обновление:</span>
                <span>{new Date(device.updatedAt).toLocaleString("ru-RU")}</span>
              </div>
            </div>
          </div>
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