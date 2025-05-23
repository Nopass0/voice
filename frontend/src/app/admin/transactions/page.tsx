/* --------------------------------------------------------------
   Страница «Транзакции»
-------------------------------------------------------------- */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { addDays, formatISO, startOfDay, type DateRange } from "date-fns";

import { cn } from "@/lib/utils";
import {
  useTransactions,
  useUpdateTxn,
  Transaction,
} from "@/hooks/useTransactions";
import { useAdmin } from "@/hooks/useAdmin";

/* ---------- shadcn/ui ---------- */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* ---------- icons & feedback ---------- */
import {
  Copy,
  Loader2,
  Pencil,
  Search,
  Filter,
  Building,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

/* ---------- константы ---------- */
const PAGE_SIZE = 20;
const EMPTY = "all";
const REFRESH_MS = 10_000;

/* ---------- helpers ---------- */
const usdtOf = (t: Transaction) =>
  t.rate ? +(t.amount / t.rate).toFixed(2) : "—";

const humanStatus: Record<string, string> = {
  CREATED: "Создана",
  DISPUTE: "Спор",
  EXPIRED: "Истекла",
  READY: "Готова",
  CANCELED: "Отменена",
};

const typeText: Record<"IN" | "OUT", string> = {
  IN: "Пополнение",
  OUT: "Выплата",
};

/** OKLCH-цвет, реагирует на тему */
function hashColor(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = text.charCodeAt(i) + ((h << 5) - h);

  // ±360 на всякий случай
  h = ((h % 360) + 360) % 360;

  // яркость под тему
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const l = isDark ? 0.35 : 0.85;

  return `oklch(${l} 0.22 ${h})`;
}

/* =======================================================================
   PAGE
======================================================================= */
export default function TransactionsPage() {
  /* ---------- state / filters ---------- */
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ id: string; desc: boolean }>({
    id: "updatedAt",
    desc: true,
  });

  const [status, setStatus] = useState<string>();
  const [methodId, setMethodId] = useState<string>();
  const [bank, setBank] = useState<string>();
  const [range, setRange] = useState<DateRange>();

  const { enums, methods } = useAdmin();

  /* ---------- query ---------- */
  const { data, isLoading, refetch } = useTransactions({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status,
    methodId,
    assetOrBank: bank,
    createdFrom: range?.from ? formatISO(range.from) : undefined,
    createdTo: range?.to ? formatISO(range.to) : undefined,
    sortBy: sort.id,
    sortOrder: sort.desc ? "desc" : "asc",
  });

  /* ---------- auto refresh ---------- */
  const prevIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    prevIds.current = new Set((data?.data ?? []).map((t) => t.id));
  }, [data]);

  useEffect(() => {
    const i = setInterval(async () => {
      const res = await refetch();
      const fresh = res.data?.data ?? [];
      const appeared = fresh.filter((t) => !prevIds.current.has(t.id));
      if (appeared.length)
        toast.success(`Новых транзакций: ${appeared.length}`);
    }, REFRESH_MS);
    return () => clearInterval(i);
  }, [refetch]);

  /* ---------- columns ---------- */
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: "id",
        header: "ID",
        cell: ({ row }) => (
          <IdCell
            numericId={row.original.numericId}
            orderId={row.original.orderId}
          />
        ),
      },
      {
        id: "dates",
        header: "Даты",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <>
            <span className="block leading-4">
              <span className="text-xs text-muted-foreground">
                Создана&nbsp;
              </span>
              {new Date(row.original.createdAt).toLocaleString("ru")}
            </span>
            <span className="block leading-4">
              <span className="text-xs text-muted-foreground">
                Обновлена&nbsp;
              </span>
              {new Date(row.original.updatedAt).toLocaleString("ru")}
            </span>
          </>
        ),
        sortingFn: "datetime",
      },
      {
        id: "type",
        header: "Тип",
        accessorKey: "type",
        cell: ({ row }) => (
          <Badge
            style={{ background: hashColor(row.original.type) }}
            className="font-medium"
          >
            {typeText[row.original.type as "IN" | "OUT"]}
          </Badge>
        ),
      },
      {
        id: "method",
        header: "Метод",
        accessorKey: "method.id",
        cell: ({ row }) => (
          <Badge style={{ background: hashColor(row.original.method.name) }}>
            {row.original.method.name}
          </Badge>
        ),
      },
      {
        id: "bank",
        header: "Банк / Актив",
        accessorKey: "assetOrBank",
        cell: ({ row }) => (
          <Badge style={{ background: hashColor(row.original.assetOrBank) }}>
            {row.original.assetOrBank}
          </Badge>
        ),
      },
      {
        id: "amount",
        header: "Сумма",
        accessorKey: "amount",
        cell: ({ row }) => (
          <>
            {row.original.amount}
            <div className="text-xs text-muted-foreground">
              {usdtOf(row.original)} USDT
            </div>
          </>
        ),
      },
      { accessorKey: "rate", header: "Курс", id: "rate" },
      {
        accessorKey: "status",
        header: "Статус",
        id: "status",
        cell: ({ row }) =>
          humanStatus[row.original.status] ?? row.original.status,
      },
      {
        id: "merchant",
        header: "Мерчант",
        accessorKey: "merchant.name",
        cell: ({ row }) => (
          <Badge style={{ background: hashColor(row.original.merchant.name) }}>
            {row.original.merchant.name}
          </Badge>
        ),
      },
      {
        id: "clientName",
        header: "Реквизит",
        accessorKey: "clientName",
        cell: ({ row }) => (
          <Badge style={{ background: hashColor(row.original.clientName) }}>
            {row.original.clientName}
          </Badge>
        ),
      },
      {
        id: "trader",
        header: "Трейдер / Δ",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.trader ? (
              <span>
                {row.original.trader.name ?? row.original.trader.email} (
                {row.original.trader.id})
              </span>
            ) : (
              "нет"
            )}
            <EditBtn txn={row.original} statuses={enums.data?.status ?? []} />
          </div>
        ),
      },
    ],
    [enums.data],
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting: [{ id: sort.id, desc: sort.desc }] },
    onSortingChange: (u) =>
      setSort({ id: u[0].id as string, desc: u[0].desc! }),
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  /* =================================================================== */

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Транзакции</h1>

      {/* ---------------- ФИЛЬТРЫ ---------------- */}
      <div className="flex flex-wrap items-end gap-2 mb-4">
        {/* поиск */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="pl-8 h-8 w-48"
          />
        </div>

        {/* статус */}
        <Select
          value={status ?? EMPTY}
          onValueChange={(v) => {
            setPage(1);
            setStatus(v === EMPTY ? undefined : v);
          }}
        >
          <SelectTrigger className="h-8 w-[160px] bg-secondary">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value={EMPTY}>Все</SelectItem>
            {enums.data?.status.map((s) => (
              <SelectItem key={s} value={s}>
                {humanStatus[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* метод */}
        <Select
          value={methodId ?? EMPTY}
          onValueChange={(v) => {
            setPage(1);
            setMethodId(v === EMPTY ? undefined : v);
          }}
        >
          <SelectTrigger className="h-8 w-[200px] bg-secondary">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Метод" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value={EMPTY}>Все</SelectItem>
            {methods.data?.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* банк */}
        <div className="relative">
          <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Банк / актив"
            value={bank ?? ""}
            onChange={(e) => {
              setPage(1);
              setBank(e.target.value || undefined);
            }}
            className="pl-8 h-8 w-40"
          />
        </div>

        {/* диапазон */}
        <DateRangePicker value={range} onChange={setRange} />

        <span className="ml-auto text-sm">{data?.meta.total ?? 0}&nbsp;шт</span>
      </div>

      {/* ---------------- ТАБЛИЦА ---------------- */}
      <div className="overflow-x-auto rounded-lg border border-muted/40">
        <Table className="min-w-[1300px] text-sm">
          <TableHeader className="bg-muted/20">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={cn(
                      "px-3 py-2 font-medium whitespace-nowrap select-none",
                      h.column.getCanSort() && "cursor-pointer",
                    )}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" && " ↑"}
                    {h.column.getIsSorted() === "desc" && " ↓"}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-6 text-center text-muted-foreground"
                >
                  <Loader2 className="animate-spin inline-block mr-2" />
                  Загрузка…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(
                    "transition-colors group hover:bg-accent/70",
                    !prevIds.current.has((r.original as Transaction).id) &&
                      "animate-in fade-in duration-700",
                  )}
                >
                  {r.getVisibleCells().map((c) => (
                    <TableCell
                      key={c.id}
                      className="px-3 py-2 whitespace-nowrap"
                    >
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-6 text-center"
                >
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---------------- ПАГИНАЦИЯ ---------------- */}
      <div className="flex justify-between items-center mt-4 gap-2 flex-wrap">
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Пред.
        </Button>
        <span className="text-sm">
          Стр. {page}/{data?.meta.totalPages ?? 1}
        </span>
        <Button
          size="sm"
          disabled={page >= (data?.meta.totalPages ?? 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          След. →
        </Button>
      </div>
    </>
  );
}

/* =====================================================================
   ID-ячейка (# + копирование)
===================================================================== */
function IdCell({
  numericId,
  orderId,
}: {
  numericId: number;
  orderId: string;
}) {
  return (
    <div className="relative pr-5 group">
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground text-xs">#</span>
        {numericId}
      </div>
      <div className="text-xs text-muted-foreground">{orderId}</div>

      <Copy
        size={16}
        className="absolute top-0 right-0 opacity-0 transition-opacity cursor-pointer group-hover:opacity-60 hover:opacity-100"
        onClick={() => {
          navigator.clipboard.writeText(String(numericId));
          toast.success("ID скопирован");
        }}
      />
    </div>
  );
}

/* =====================================================================
   EditBtn
===================================================================== */
function EditBtn({ txn, statuses }: { txn: Transaction; statuses: string[] }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState({
    amount: txn.amount,
    commission: txn.commission,
    status: txn.status,
  });

  const upd = useUpdateTxn();
  const save = () =>
    upd.mutate({ id: txn.id, ...local }, { onSuccess: () => setOpen(false) });

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6"
        onClick={() => setOpen(true)}
      >
        <Pencil size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Редактирование</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            {(
              [
                ["Сумма", "amount"],
                ["Комиссия", "commission"],
              ] as const
            ).map(([lbl, key]) => (
              <div key={key} className="grid gap-1">
                <Label>{lbl}</Label>
                <Input
                  type="number"
                  value={local[key]}
                  onChange={(e) =>
                    setLocal({ ...local, [key]: +e.target.value })
                  }
                />
              </div>
            ))}

            <div className="grid gap-1">
              <Label>Статус</Label>
              <Select
                value={local.status}
                onValueChange={(v) => setLocal({ ...local, status: v })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button size="sm" onClick={save} disabled={upd.isPending}>
              {upd.isPending ? "Сохраняю…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* =====================================================================
   DateRangePicker
===================================================================== */
function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (v: DateRange | undefined) => void;
}) {
  const presets: { label: string; range?: DateRange }[] = [
    { label: "Всё время" },
    {
      label: "Сегодня",
      range: { from: startOfDay(new Date()), to: new Date() },
    },
    {
      label: "7 дней",
      range: { from: addDays(new Date(), -7), to: new Date() },
    },
    {
      label: "30 дней",
      range: { from: addDays(new Date(), -30), to: new Date() },
    },
  ];

  const label =
    presets.find(
      (p) =>
        p.range &&
        value &&
        p.range.from?.toDateString() === value.from?.toDateString() &&
        p.range.to?.toDateString() === value.to?.toDateString(),
    )?.label ??
    (value
      ? `${value.from?.toLocaleDateString()}–${value.to?.toLocaleDateString()}`
      : "Диапазон");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="h-8">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 space-y-2 bg-card">
        {presets.map(({ label, range }) => (
          <Button
            key={label}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => onChange(range)}
          >
            {label}
          </Button>
        ))}

        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from}
        />
      </PopoverContent>
    </Popover>
  );
}
