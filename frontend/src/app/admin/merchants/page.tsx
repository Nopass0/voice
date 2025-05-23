/* --------------------------------------------------------------
   /admin/merchants/page.tsx
-------------------------------------------------------------- */
"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash,
  RefreshCw,
  KeyRound,
  Plug,
  Plug2,
  Power,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";

/* ----------------------- инфраструктура ---------------------- */
import { useAdmin } from "@/hooks/useAdmin";
import {
  Merchant,
  Method,
  MerchantMethod, // { id, method, isEnabled }
} from "@/types/admin";

/* shadcn/ui --------------------------------------------------- */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/* ---------- helpers ---------- */
const fade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const IconBtn = ({
  tip,
  icon,
  onClick,
}: {
  tip: string;
  icon: React.ReactNode;
  onClick: () => void;
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

/* тип состояния формы мерчанта */
type FormState = Omit<Merchant, "id" | "token">;

/* =================================================================
   MAIN PAGE
================================================================= */
export default function MerchantsPage() {
  const qc = useQueryClient();

  /* ---------- hook ---------- */
  const {
    merchants,
    createMerchant,
    deleteMerchant,
    regenerateMerchantToken,
    updateMerchant,
    methods,
    merchantMethods,
    assignMethod,
    unassignMethod,
    toggleMethod,
  } = useAdmin();

  /* ---------- modal: create / edit ---------- */
  const empty: FormState = { name: "" };
  const [form, setForm] = useState<FormState>(empty);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const openNew = () => {
    setEditId(null);
    setForm(empty);
    setOpenCreate(true);
  };
  const openEdit = (m: Merchant) => {
    setEditId(m.id);
    setForm({ name: m.name });
    setOpenCreate(true);
  };

  const submit = () => {
    if (editId) {
      /* rename */
      updateMerchant.mutate(
        { id: editId, name: form.name },
        {
          onSuccess: () => {
            toast.success("Имя обновлено");
            setOpenCreate(false);
          },
          onError: (e) => toast.error(e.message),
        },
      );
    } else {
      /* create */
      createMerchant.mutate(form.name, {
        onSuccess: () => {
          toast.success("Мерчант создан");
          setOpenCreate(false);
        },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  /* ---------- modal: методы мерчанта ---------- */
  const [openMethods, setOpenMethods] = useState<Merchant | null>(null);

  /* helper для списка методов мерчанта (assign-ы) */
  const assigned = merchantMethods(openMethods?.id);

  /* ---------- render ---------- */
  return (
    <>
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Мерчанты</h1>
        <Button size="sm" variant="gradient" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" />
          Новый
        </Button>
      </header>

      {/* ---------- grid карточек ---------- */}
      <AnimatePresence mode="popLayout">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {merchants.data?.map((m) => (
            <motion.div
              key={m.id}
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="rounded-xl shadow hover:shadow-lg transition-shadow">
                <CardHeader className="pb-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg truncate">
                      {m.name}
                    </span>

                    {/* – короткий токен */}
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase"
                    >
                      {m.token.slice(0, 4)}…{m.token.slice(-4)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-1 space-y-1 text-sm">
                  <p className="flex items-center gap-1 text-muted-foreground text-[13px]">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="truncate">{m.token}</span>
                  </p>
                </CardContent>

                <CardFooter className="gap-1">
                  <IconBtn
                    tip="Редактировать имя"
                    icon={<Pencil className="h-4 w-4" />}
                    onClick={() => openEdit(m)}
                  />
                  <IconBtn
                    tip="Новый токен"
                    icon={<RefreshCw className="h-4 w-4" />}
                    onClick={() =>
                      regenerateMerchantToken.mutate(m.id, {
                        onSuccess: (token) => {
                          navigator.clipboard.writeText(token);
                          toast.success("Новый токен скопирован");
                          qc.invalidateQueries({ queryKey: ["merchants"] });
                        },
                        onError: (e) => toast.error(e.message),
                      })
                    }
                  />
                  <IconBtn
                    tip="Методы"
                    icon={<Plug className="h-4 w-4" />}
                    onClick={() => setOpenMethods(m)}
                  />
                  <IconBtn
                    tip="Удалить"
                    icon={<Trash className="h-4 w-4" />}
                    onClick={() =>
                      deleteMerchant.mutate(m.id, {
                        onSuccess: () => toast.success("Удалено"),
                        onError: (e) => toast.error(e.message),
                      })
                    }
                  />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* ---------- Dialog: создать / редактировать ---------- */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Изменить имя мерчанта" : "Новый мерчант"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Название</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              size="sm"
              onClick={submit}
              disabled={
                createMerchant.isPending ||
                updateMerchant.isPending ||
                form.name.trim() === ""
              }
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Dialog: методы конкретного мерчанта ---------- */}
      <Dialog
        open={!!openMethods}
        onOpenChange={() => setOpenMethods(null)}
        modal
      >
        {openMethods && (
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Методы &nbsp;
                <span className="font-semibold">{openMethods.name}</span>
              </DialogTitle>
            </DialogHeader>

            {/* список назначенных */}
            <section className="space-y-2 mb-4">
              {assigned.data?.map((am) => (
                <div
                  key={am.id}
                  className="flex items-center justify-between rounded border px-2 py-1"
                >
                  <span className="flex items-center gap-1">
                    <Power
                      className={`h-3.5 w-3.5 ${
                        am.isEnabled
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    {am.method.name}
                  </span>

                  <div className="flex items-center gap-1">
                    <Switch
                      checked={am.isEnabled}
                      onCheckedChange={(val) =>
                        toggleMethod.mutate(
                          { id: am.id, isEnabled: val },
                          { onError: (e) => toast.error(e.message) },
                        )
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() =>
                        unassignMethod.mutate(am.id, {
                          onError: (e) => toast.error(e.message),
                        })
                      }
                    >
                      <Plug2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {assigned.data?.length === 0 && (
                <p className="text-muted-foreground text-sm text-center">
                  Нет назначенных методов
                </p>
              )}
            </section>

            {/* добавить новый */}
            <div className="grid gap-2">
              <Label className="text-xs">Добавить метод</Label>
              <Select
                onValueChange={(methodId) =>
                  assignMethod.mutate(
                    {
                      merchantId: openMethods.id,
                      methodId,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Метод добавлен");
                      },
                      onError: (e) => toast.error(e.message),
                    },
                  )
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Выберите метод" />
                </SelectTrigger>
                <SelectContent>
                  {methods.data
                    ?.filter(
                      (mth) =>
                        !assigned.data?.some((am) => am.method.id === mth.id),
                    )
                    .map((mth) => (
                      <SelectItem key={mth.id} value={mth.id}>
                        {mth.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setOpenMethods(null)}>
                Готово
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
