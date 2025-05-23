/* ------------------------------------------------------------------
   Модалка: подробности по подключённым устройствам
------------------------------------------------------------------ */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Monitor,
  BatteryCharging,
  Wifi,
  QrCode,
} from "lucide-react";

type Device = {
  id: string;
  name: string;
  os: string;
  battery: number;
  online: boolean;
  speed: number; // Mbps
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  devices: Device[];
  onShowQR: () => void;
}

const iconByOs = (os: string) =>
  os.startsWith("Android") ? (
    <Smartphone className="h-4 w-4 mr-1" />
  ) : (
    <Monitor className="h-4 w-4 mr-1" />
  );

export default function DeviceInfoModal({
  open,
  onOpenChange,
  devices,
  onShowQR,
}: Props) {
  if (!devices.length) return null;

  const firstId = devices[0].id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Устройства
            <Button size="icon" variant="ghost" onClick={onShowQR}>
              <QrCode className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {devices.length > 1 && (
          <Tabs defaultValue={firstId} className="mb-4">
            <TabsList className="grid grid-cols-2">
              {devices.map((d) => (
                <TabsTrigger key={d.id} value={d.id}>
                  {d.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {devices.map((d) => (
              <div key={d.id} value={d.id} className="space-y-3 py-2">
                <div className="flex items-center">
                  {iconByOs(d.os)}
                  <span className="font-medium">{d.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{d.os}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <BatteryCharging className="h-4 w-4" />
                    {d.battery} %
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    {d.speed} Mbps
                  </span>
                  {d.online ? (
                    <span className="text-green-600">online</span>
                  ) : (
                    <span className="text-red-500">offline</span>
                  )}
                </div>
              </div>
            ))}
          </Tabs>
        )}

        {devices.length === 1 && (
          <div className="space-y-3">
            <div className="flex items-center">
              {iconByOs(devices[0].os)}
              <span className="font-medium">{devices[0].name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{devices[0].os}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <BatteryCharging className="h-4 w-4" />
                {devices[0].battery} %
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="h-4 w-4" />
                {devices[0].speed} Mbps
              </span>
              {devices[0].online ? (
                <span className="text-green-600">online</span>
              ) : (
                <span className="text-red-500">offline</span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
