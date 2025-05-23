/* ------------------------------------------------------------------
   Страница «Реквизиты» — с модалкой формы и QR-кодом
------------------------------------------------------------------ */
"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Archive,
  Undo2,
  Pen,
  QrCode,
  Smartphone,
  BatteryCharging,
  Wifi
} from "lucide-react";
import {
  useBankDetails,
  useCreateBankDetail,
  useArchiveBankDetail,
} from "@/hooks/useBankDetails";
import RequisiteQRModal from "../_sections/RequisiteQRModal";
import BankDetailDeviceModal from "../_sections/BankDetailDeviceModal";
import { Device } from "@/api/bankDetails";

/* ---------- константы из enum ---------- */
const BANK_TYPES = [
  "SBERBANK",
  "RAIFFEISEN",
  "GAZPROMBANK",
  "POCHTABANK",
  "VTB",
  "ROSSELKHOZBANK",
  "ALFABANK",
  "URALSIB",
  "LOKOBANK",
  "AKBARS",
  "MKB",
  "SPBBANK",
  "MTSBANK",
  "PROMSVYAZBANK",
  "OZONBANK",
  "RENAISSANCE",
  "OTPBANK",
  "AVANGARD",
  "VLADBUSINESSBANK",
  "TAVRICHESKIY",
  "FORABANK",
  "BCSBANK",
  "HOMECREDIT",
  "BBRBANK",
  "CREDITEUROPE",
  "RNKB",
  "UBRIR",
  "GENBANK",
  "SINARA",
  "ABSOLUTBANK",
  "MTSMONEY",
  "SVOYBANK",
  "TRANSKAPITALBANK",
  "DOLINSK",
];

const METHOD_TYPES = [
  "upi",
  "c2ckz",
  "c2cuz",
  "c2caz",
  "c2c",
  "sbp",
  "spay",
  "tpay",
  "vpay",
  "apay",
  "m2ctj",
  "m2ntj",
  "m2csber",
  "m2ctbank",
  "connectc2c",
  "connectsbp",
  "nspk",
  "ecom",
  "crypto",
];

/* ------------------------------------------------------------------
   Компонент страницы
------------------------------------------------------------------ */
export default function BankDetailsPage() {
  /* ---------- state ---------- */
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [openQR, setOpenQR] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);

  const [openDeviceModal, setOpenDeviceModal] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  /* ---------- queries ---------- */
  const { data, isLoading, isError } = useBankDetails({
    archived: tab === "archived",
  });
  const archiveMut = useArchiveBankDetail();
  const createMut = useCreateBankDetail();

  /* ---------- form state ---------- */
  const [form, setForm] = useState({
    cardNumber: "",
    bankType: "",
    methodType: "",
    recipientName: "",
    phoneNumber: "",
    minAmount: "",
    maxAmount: "",
    intervalMinutes: "0",
    dailyLimit: "",
    monthlyLimit: "",
  });

  const resetForm = () =>
    setForm({
      cardNumber: "",
      bankType: "",
      methodType: "",
      recipientName: "",
      phoneNumber: "",
      minAmount: "",
      maxAmount: "",
      intervalMinutes: "0",
      dailyLimit: "",
      monthlyLimit: "",
    });

  const openAdd = () => {
    resetForm();
    setEditingId(null);
    setOpenForm(true);
  };

  const openEdit = (d: any) => {
    setForm({
      cardNumber: d.cardNumber,
      bankType: d.bankType,
      methodType: d.methodType,
      recipientName: d.recipientName,
      phoneNumber: d.phoneNumber ?? "",
      minAmount: String(d.minAmount),
      maxAmount: String(d.maxAmount),
      intervalMinutes: String(d.intervalMinutes),
      dailyLimit: String(d.dailyLimit),
      monthlyLimit: String(d.monthlyLimit),
    });
    setEditingId(d.id);
    setOpenForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const toNum = (v: string) => (v.trim() === "" ? 0 : Number(v));

    createMut.mutate({
      ...(editingId ? { id: editingId } : {}),
      cardNumber: form.cardNumber.trim(),
      bankType: form.bankType,
      methodType: form.methodType,
      recipientName: form.recipientName.trim(),
      phoneNumber: form.phoneNumber.trim() || null,
      minAmount: toNum(form.minAmount),
      maxAmount: toNum(form.maxAmount),
      dailyLimit: toNum(form.dailyLimit),
      monthlyLimit: toNum(form.monthlyLimit),
      intervalMinutes: toNum(form.intervalMinutes),
    });
  };

  /* ---------- helper ---------- */
  const openQRModal = (id: string) => {
    setQrId(id);
    setOpenQR(true);
  };

  const openDeviceInfo = (device: Device) => {
    setCurrentDevice(device);
    setOpenDeviceModal(true);
  };

  /* ---------- render ---------- */
  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Реквизиты</h1>
        <Button variant="gradient" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Добавить реквизит
        </Button>
      </div>

      {/* tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="archived">В архиве</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* таблица данных */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : isError || !data || data.length === 0 ? (
        <p className="text-destructive">Не удалось загрузить данные.</p>
      ) : (
        <div className="overflow-auto rounded-lg border shadow-sm">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead>Номер карты</TableHead>
                <TableHead>Банк</TableHead>
                <TableHead>Метод</TableHead>
                <TableHead>Получатель</TableHead>
                <TableHead className="text-right">Оборот / день</TableHead>
                <TableHead className="text-right">Оборот / всё время</TableHead>
                <TableHead>
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/50">
                  <TableCell>{d.cardNumber}</TableCell>
                  <TableCell>{d.bankType}</TableCell>
                  <TableCell>{d.methodType}</TableCell>
                  <TableCell>{d.recipientName}</TableCell>
                  <TableCell className="text-right">
                    {d.turnoverDay.toLocaleString("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {d.turnoverTotal.toLocaleString("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                    })}
                  </TableCell>

                  {/* действия */}
                  <TableCell className="flex gap-2">
                    {/* Устройство или QR-код для подключения */}
                    {d.hasDevice && d.device ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeviceInfo(d.device!)}
                        className="relative pl-6"
                      >
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          <span className={`w-2 h-2 rounded-full ${d.device.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {d.device.isOnline && (
                            <span className="absolute w-3 h-3 rounded-full bg-green-500 opacity-60 animate-ping"></span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Smartphone className="h-3.5 w-3.5" />
                          {d.device.name}
                          <BatteryCharging
                            className={`h-3.5 w-3.5 ml-1 ${
                              d.device.energy > 70 ? 'text-green-500' :
                              d.device.energy > 30 ? 'text-yellow-500' :
                              'text-red-500'
                            }`}
                          />
                          <span className={`text-xs ${
                            d.device.energy > 70 ? 'text-green-500' :
                            d.device.energy > 30 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {d.device.energy}%
                          </span>
                          <Wifi
                            className={`h-3.5 w-3.5 ${
                              d.device.ethernetSpeed > 5 ? 'text-blue-500' :
                              d.device.ethernetSpeed > 2 ? 'text-teal-500' :
                              'text-orange-500'
                            }`}
                          />
                          <span className={`text-xs ${
                            d.device.ethernetSpeed > 5 ? 'text-blue-500' :
                            d.device.ethernetSpeed > 2 ? 'text-teal-500' :
                            'text-orange-500'
                          }`}>
                            {d.device.ethernetSpeed}
                          </span>
                        </span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openQRModal(d.id)}
                        aria-label="QR-код для подключения устройства"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    )}

                    {/* редактировать */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(d)}
                      aria-label="Редактировать"
                    >
                      <Pen className="h-4 w-4" />
                    </Button>

                    {/* архив / вернуть */}
                    {tab === "active" ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          archiveMut.mutate({ id: d.id, archived: true })
                        }
                        aria-label="В архив"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          archiveMut.mutate({ id: d.id, archived: false })
                        }
                        aria-label="Вернуть"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* форма создания / редактирования */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Изменить реквизит" : "Добавить реквизит"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-6 py-2">
            {/* row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="card">Номер карты</Label>
                <Input
                  id="card"
                  value={form.cardNumber}
                  onChange={(e) =>
                    setForm({ ...form, cardNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="recipient">Получатель</Label>
                <Input
                  id="recipient"
                  value={form.recipientName}
                  onChange={(e) =>
                    setForm({ ...form, recipientName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Телефон для автоматики</Label>
                <Input
                  id="phone"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Банк</Label>
                <Select
                  value={form.bankType}
                  onValueChange={(v) => setForm({ ...form, bankType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите банк" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {BANK_TYPES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Тип метода</Label>
                <Select
                  value={form.methodType}
                  onValueChange={(v) => setForm({ ...form, methodType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите метод" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {METHOD_TYPES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* лимиты */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "min", label: "Мин. лимит", key: "minAmount" },
                { id: "max", label: "Макс. лимит", key: "maxAmount" },
                {
                  id: "interval",
                  label: "Интервал (мин)",
                  key: "intervalMinutes",
                },
                { id: "day", label: "Лимит / день", key: "dailyLimit" },
                { id: "month", label: "Лимит / месяц", key: "monthlyLimit" },
              ].map((f) => (
                <div key={f.id} className="space-y-1">
                  <Label htmlFor={f.id}>{f.label}</Label>
                  <Input
                    id={f.id}
                    type="number"
                    value={(form as any)[f.key]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenForm(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* модалка QR-кода */}
      <RequisiteQRModal
        open={openQR}
        onOpenChange={setOpenQR}
        requisiteId={qrId}
      />

      {/* модалка с информацией об устройстве */}
      <BankDetailDeviceModal
        open={openDeviceModal}
        onOpenChange={setOpenDeviceModal}
        device={currentDevice}
      />
    </div>
  );
}
