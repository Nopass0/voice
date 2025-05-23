/* --------------------------------------------------------------
   src/app/admin/methods/page.tsx
-------------------------------------------------------------- */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash,
  Wallet,
  Download,
  Upload,
  Percent,
  Type,
} from "lucide-react";
import { toast, Toaster } from "sonner";

import { useAdmin } from "@/hooks/useAdmin";
import { Method } from "@/types/admin";

/* ---------- ui ---------- */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

/* ---------- helpers ---------- */
const fade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const IconBtn = ({
  tip,
  onClick,
  icon,
}: {
  tip: string;
  onClick: () => void;
  icon: React.ReactNode;
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const hashColor = (str: string) => {
  let h = 0;
  for (const c of str) h = c.charCodeAt(0) + ((h << 5) - h);
  return `hsl(${(h >>> 0) % 360} 70% 50%)`;
};

const Field = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-[18px_1fr] gap-1 items-start">
    <span className="text-muted-foreground">{icon}</span>
    <span>
      <span className="text-xs text-muted-foreground">{label}: </span>
      {value}
    </span>
  </div>
);

/* ---------- types ---------- */
type FormState = Omit<Method, "id" | "isEnabled">;

/* =================================================================
   PAGE
================================================================= */
export default function MethodsPage() {
  const { methods, enums, createMethod, updateMethod, deleteMethod } =
    useAdmin();

  /* modal state */
  const empty: FormState = {
    code: "",
    name: "",
    type: "upi" as any,
    currency: "rub" as any,
    commissionPayin: 0,
    commissionPayout: 0,
    maxPayin: 0,
    minPayin: 0,
    maxPayout: 0,
    minPayout: 0,
    chancePayin: 100,
    chancePayout: 100,
    rateSource: "bybit" as any,
  };
  const [form, setForm] = useState<FormState>(empty);
  const [open, setOpen] = useState(false);
  const [editId, setEdit] = useState<string | null>(null);
  const enumsData = enums.data;

  const openCreate = () => {
    setForm(empty);
    setEdit(null);
    setOpen(true);
  };
  const openEdit = (m: Method) => {
    const { id, isEnabled, ...rest } = m;
    setForm(rest);
    setEdit(id);
    setOpen(true);
  };

  const mutate = () => {
    const action = editId ? updateMethod : createMethod;
    action.mutate(editId ? { ...form, id: editId, isEnabled: true } : form, {
      onSuccess: () => {
        toast.success(editId ? "Обновлено" : "Создано");
        setOpen(false);
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const del = (id: string) =>
    deleteMethod.mutate(id, { onSuccess: () => toast.success("Удалено") });

  /* render */
  return (
    <>
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Методы</h1>
        <Button size="sm" variant="gradient" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Новый
        </Button>
      </header>

      <AnimatePresence mode="popLayout">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {methods.data?.map((m) => (
            <motion.div
              key={m.id}
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Card className="flex overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow">
                  {/* цветная лента */}
                  <motion.div
                    className="w-2"
                    style={{ background: hashColor(m.name) }}
                    whileHover={{ scaleY: 1.1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 15 }}
                  />
                  <div className="p-3 flex flex-col flex-1">
                    {/* header */}
                    <CardHeader className="p-0 mb-2 border-b border-muted/40">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg truncate">
                          {m.name}
                        </span>
                        <Badge className="px-1.5 text-[10px]">
                          {m.currency.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground truncate">
                        {m.code}
                      </span>
                    </CardHeader>

                    {/* data */}
                    <CardContent className="p-0 flex-1 space-y-1.5 text-base">
                      <Field
                        icon={<Type className="w-[14px] h-[14px]" />}
                        label="Тип"
                        value={m.type}
                      />
                      <Field
                        icon={<Download className="w-[14px] h-[14px]" />}
                        label="Приём"
                        value={`${m.minPayin}‒${m.maxPayin}`}
                      />
                      <Field
                        icon={<Upload className="w-[14px] h-[14px]" />}
                        label="Выплата"
                        value={`${m.minPayout}‒${m.maxPayout}`}
                      />
                      <Field
                        icon={<Wallet className="w-[14px] h-[14px]" />}
                        label="Комиссия"
                        value={`${m.commissionPayin}/${m.commissionPayout}`}
                      />
                      <Field
                        icon={<Percent className="w-[14px] h-[14px]" />}
                        label="Шанс"
                        value={`${m.chancePayin}%/${m.chancePayout}%`}
                      />
                    </CardContent>

                    {/* actions */}
                    <CardFooter className="p-0 pt-2 gap-1">
                      <IconBtn
                        tip="Редактировать"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => openEdit(m)}
                      />
                      <IconBtn
                        tip="Удалить"
                        icon={<Trash className="h-4 w-4" />}
                        onClick={() => del(m.id)}
                      />
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* ---- модалка (упрощённо) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto text-sm">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Редактировать" : "Новый"} метод
            </DialogTitle>
          </DialogHeader>

          {enumsData ? (
            <div className="grid gap-4">
              {/* basic */}
              <div className="grid sm:grid-cols-2 gap-3">
                {["code", "name"].map((k) => (
                  <div key={k} className="grid gap-1">
                    <Label className="text-xs">
                      {k === "code" ? "Код" : "Название"}
                    </Label>
                    <Input
                      value={(form as any)[k]}
                      onChange={(e) =>
                        setForm({ ...form, [k]: e.target.value } as any)
                      }
                    />
                  </div>
                ))}
              </div>

              {/* enums */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  ["Тип", "type", enumsData.methodType],
                  ["Валюта", "currency", enumsData.currency],
                  ["Источник", "rateSource", enumsData.rateSource],
                ].map(([lbl, key, list]) => (
                  <div key={key as string} className="grid gap-1">
                    <Label className="text-xs">{lbl}</Label>
                    <Select
                      value={(form as any)[key]}
                      onValueChange={(v) =>
                        setForm({ ...form, [key]: v } as any)
                      }
                    >
                      <SelectTrigger className="bg-card h-8 text-xs">
                        <SelectValue placeholder="Выбрать" />
                      </SelectTrigger>
                      <SelectContent>
                        {(list as string[]).map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* numbers */}
              <div className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    ["Ком. In", "commissionPayin"],
                    ["Ком. Out", "commissionPayout"],
                    ["Min In", "minPayin"],
                    ["Max In", "maxPayin"],
                    ["Min Out", "minPayout"],
                    ["Max Out", "maxPayout"],
                    ["Chance In", "chancePayin"],
                    ["Chance Out", "chancePayout"],
                  ] as const
                ).map(([lbl, key]) => (
                  <div key={key} className="grid gap-1">
                    <Label className="text-xs">{lbl}</Label>
                    <Input
                      type="number"
                      value={(form as any)[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: +e.target.value } as any)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center py-6">Загрузка…</p>
          )}

          <DialogFooter>
            <Button
              size="sm"
              onClick={mutate}
              disabled={createMethod.isPending || updateMethod.isPending}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
