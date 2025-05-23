/* --------------------------------------------------------------
   /admin/traders/page.tsx   (карточечный список, без <table>)
-------------------------------------------------------------- */
"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  RefreshCw,
  Trash,
  ShieldOff,
  ShieldCheck,
  Copy,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useAdmin } from "@/hooks/useAdmin";
import { User, UserWithPassword } from "@/types/admin";

import { Button } from "@/components/ui/button";
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
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

/* ---------- helpers ---------- */
const fadeY = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const IconBtn = ({
  onClick,
  icon,
  tip,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  tip: string;
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" onClick={onClick}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/* =================================================================
   MAIN PAGE
================================================================= */
export default function TradersPage() {
  const {
    users,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    regeneratePassword,
  } = useAdmin();
  const qc = useQueryClient();

  /* ---------- local modals ---------- */
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [pwdUser, setPwdUser] = useState<UserWithPassword | null>(null);
  const [confirmDel, setConfirmDel] = useState<User | null>(null);

  /* ---------- create form state ---------- */
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newBalU, setNewBalU] = useState(0);
  const [newBalR, setNewBalR] = useState(0);

  /* ---------- edit form state ---------- */
  const [eName, setEName] = useState("");
  const [eBalU, setEBalU] = useState(0);
  const [eBalR, setEBalR] = useState(0);

  React.useEffect(() => {
    if (editUser) {
      setEName(editUser.name);
      setEBalU(editUser.balanceUsdt);
      setEBalR(editUser.balanceRub);
    }
  }, [editUser]);

  /* ---------- mutations ---------- */
  const onCreate = () => {
    createUser.mutate(
      {
        email: newEmail,
        name: newName,
        balanceUsdt: newBalU,
        balanceRub: newBalR,
      },
      {
        onSuccess: (u) => {
          qc.setQueryData<User[] | undefined>(["users"], (old) =>
            old ? [...old, u] : [u],
          );
          toast.success("Трейдер создан");
          setCreateOpen(false);
          setPwdUser(u); // показать пароль
          setNewEmail("");
          setNewName("");
          setNewBalU(0);
          setNewBalR(0);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const onUpdate = () => {
    if (!editUser) return;
    updateUser.mutate(
      { ...editUser, name: eName, balanceUsdt: eBalU, balanceRub: eBalR },
      {
        onSuccess: () => {
          toast.success("Обновлено");
          setEditUser(null);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const onDelete = () => {
    if (!confirmDel) return;
    deleteUser.mutate(confirmDel.id, {
      onSuccess: () => {
        qc.setQueryData<User[] | undefined>(["users"], (old) =>
          old?.filter((u) => u.id !== confirmDel.id),
        );
        toast.success("Удалён");
        setConfirmDel(null);
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const onBanToggle = (u: User) => {
    banUser.mutate(u.id, {
      onSuccess: () =>
        toast.success(u.banned ? "Разблокирован" : "Заблокирован"),
      onError: (e) => toast.error(e.message),
    });
  };

  const onRegenerate = (u: User) => {
    regeneratePassword.mutate(u.id, {
      onSuccess: ({ newPassword }) => {
        setPwdUser({ ...u, plainPassword: newPassword });
        toast.success("Новый пароль создан");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  /* =================================================================
     RENDER
  ================================================================== */
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Трейдеры</h1>
        <Button variant="gradient" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Новый трейдер
        </Button>
      </div>

      {/* ---------- Cards grid ---------- */}
      <AnimatePresence initial={false}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.data?.map((u) => (
            <motion.div
              key={u.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeY}
              transition={{ duration: 0.25 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-sm space-y-1">
                    <p>
                      USDT: <b>{u.balanceUsdt}</b>
                    </p>
                    <p>
                      ₽: <b>{u.balanceRub}</b>
                    </p>
                    {u.banned && (
                      <p className="text-destructive">Заблокирован</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-1 flex-wrap">
                  <IconBtn
                    onClick={() => setEditUser(u)}
                    icon={<Pencil className="w-4 h-4" />}
                    tip="Редактировать"
                  />
                  <IconBtn
                    onClick={() => onRegenerate(u)}
                    icon={<RefreshCw className="w-4 h-4" />}
                    tip="Новый пароль"
                  />
                  <IconBtn
                    onClick={() => onBanToggle(u)}
                    icon={
                      u.banned ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <ShieldOff className="w-4 h-4" />
                      )
                    }
                    tip={u.banned ? "Разблок." : "Блок"}
                  />
                  <IconBtn
                    onClick={() => setConfirmDel(u)}
                    icon={<Trash className="w-4 h-4" />}
                    tip="Удалить"
                  />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* ----------------------------------------------------------------
         МОДАЛКИ
      ---------------------------------------------------------------- */}
      {/* 1-Создание */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый трейдер</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Имя</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="grid flex-1 gap-2">
                <Label>USDT</Label>
                <Input
                  type="number"
                  value={newBalU}
                  onChange={(e) => setNewBalU(+e.target.value)}
                />
              </div>
              <div className="grid flex-1 gap-2">
                <Label>₽</Label>
                <Input
                  type="number"
                  value={newBalR}
                  onChange={(e) => setNewBalR(+e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onCreate} disabled={createUser.isPending}>
              {createUser.isPending ? "Создание…" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2-Редактирование */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать</DialogTitle>
          </DialogHeader>
          {editUser && (
            <>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={editUser.email} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Имя</Label>
                  <Input
                    value={eName}
                    onChange={(e) => setEName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="grid flex-1 gap-2">
                    <Label>USDT</Label>
                    <Input
                      type="number"
                      value={eBalU}
                      onChange={(e) => setEBalU(+e.target.value)}
                    />
                  </div>
                  <div className="grid flex-1 gap-2">
                    <Label>₽</Label>
                    <Input
                      type="number"
                      value={eBalR}
                      onChange={(e) => setEBalR(+e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={onUpdate} disabled={updateUser.isPending}>
                  {updateUser.isPending ? "Сохранение…" : "Сохранить"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 3-Новый пароль */}
      <Dialog open={!!pwdUser} onOpenChange={() => setPwdUser(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Новый пароль</DialogTitle>
          </DialogHeader>
          {pwdUser && (
            <div className="space-y-3">
              <p>
                Для <b>{pwdUser.email}</b> создан новый пароль. Скопируйте его —
                повторно показать не сможем.
              </p>
              <div className="relative">
                <Input readOnly value={pwdUser.plainPassword} />
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => {
                    navigator.clipboard.writeText(pwdUser.plainPassword);
                    toast.success("Скопировано");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPwdUser(null)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4-Удаление */}
      <Dialog open={!!confirmDel} onOpenChange={() => setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить пользователя?</DialogTitle>
          </DialogHeader>
          {confirmDel && (
            <p>
              Удалить <b>{confirmDel.email}</b>? Это действие необратимо.
            </p>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDel(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Удаление…" : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ——— Toast контейнер ——— */}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
