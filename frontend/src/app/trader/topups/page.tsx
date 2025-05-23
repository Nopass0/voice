"use client";

import React, { useState, useMemo } from "react";
import {
  useTraderTransactions,
  useUpdateTransactionStatus,
  Transaction,
} from "@/hooks/useTraderTransactions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  ChevronDown,
  ChevronsUpDown,
  Info,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 *  Статусы
 * ------------------------------------------------------------------------*/
const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  CREATED: { label: "Создана", variant: "secondary" },
  READY: { label: "Готова", variant: "default" },
  DISPUTE: { label: "Спор", variant: "destructive" },
  EXPIRED: { label: "Истекла", variant: "outline" },
  CANCELED: { label: "Отменена", variant: "outline" },
};
const STATUS_OPTIONS = Object.keys(STATUS_MAP) as (keyof typeof STATUS_MAP)[];

const LIMIT = 20;

/* --------------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------------*/
const toUsdt = (tx: Transaction) =>
  tx.currency?.toLowerCase() === "usdt" || !tx.rate
    ? tx.amount
    : tx.amount / tx.rate;

const sortFn = (
  a: Transaction,
  b: Transaction,
  field: string,
  dir: "asc" | "desc",
) => {
  const factor = dir === "asc" ? 1 : -1;
  switch (field) {
    case "numericId":
      return (a.numericId - b.numericId) * factor;
    case "amount":
      return (a.amount - b.amount) * factor;
    case "usdt":
      return (toUsdt(a) - toUsdt(b)) * factor;
    case "commission":
      return (a.commission - b.commission) * factor;
    case "createdAt":
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        factor
      );
    default:
      return 0;
  }
};

/* --------------------------------------------------------------------------
 *  Page component
 * ------------------------------------------------------------------------*/
export default function DepositsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openedTx, setOpenedTx] = useState<Transaction | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string | number> = {
      page,
      limit: LIMIT,
      type: "IN",
      sort: `${sortField}:${sortDir}`,
    };
    if (search) p.q = search;
    if (statusFilter) p.status = statusFilter;
    if (dateFrom) p.dateFrom = dateFrom.toISOString();
    if (dateTo) p.dateTo = dateTo.toISOString();
    return p;
  }, [page, search, statusFilter, dateFrom, dateTo, sortField, sortDir]);

  const { data, isLoading, isError, refetch } = useTraderTransactions(params);
  const updateStatus = useUpdateTransactionStatus();

  /* ---- actions ---- */
  const changeStatus = (id: string, status: string) =>
    updateStatus.mutate({ id, status });

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const applyFilters = () => {
    setPage(1);
    refetch();
  };

  const rows = useMemo(() => {
    if (!data) return [] as Transaction[];
    return [...data.data].sort((a, b) => sortFn(a, b, sortField, sortDir));
  }, [data, sortField, sortDir]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (isError || !data)
    return (
      <p className="text-destructive text-center mt-16">
        Не удалось загрузить данные.
      </p>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Пополнения</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border shadow-sm p-4 bg-background/70 backdrop-blur-md">
        <Input
          placeholder="Поиск (№, сумма, ФИО, способ, профит)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-60 h-9"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-44 justify-between h-9">
              {statusFilter ? STATUS_MAP[statusFilter].label : "Все статусы"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-60 overflow-y-auto"
          >
            <DropdownMenuItem onSelect={() => setStatusFilter(undefined)}>
              Все
            </DropdownMenuItem>
            {STATUS_OPTIONS.map((s) => (
              <DropdownMenuItem key={s} onSelect={() => setStatusFilter(s)}>
                {STATUS_MAP[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DatePopover label="От" date={dateFrom} setDate={setDateFrom} />
        <DatePopover label="До" date={dateTo} setDate={setDateTo} />

        <Button onClick={applyFilters} className="h-9">
          Применить
        </Button>
        <span className="ml-auto text-muted-foreground text-sm">
          Всего: {data.pagination.total}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border shadow-sm">
        <Table className="min-w-[1400px]">
          <TableHeader>
            <TableRow>
              <SortableTh
                field="numericId"
                activeField={sortField}
                dir={sortDir}
                onClick={toggleSort}
              >
                Номер
              </SortableTh>
              <TableHead>Статус</TableHead>
              <SortableTh
                field="createdAt"
                activeField={sortField}
                dir={sortDir}
                onClick={toggleSort}
              >
                Создано
              </SortableTh>
              <SortableTh
                field="amount"
                activeField={sortField}
                dir={sortDir}
                onClick={toggleSort}
                className="text-right"
              >
                Сумма
              </SortableTh>
              <SortableTh
                field="usdt"
                activeField={sortField}
                dir={sortDir}
                onClick={toggleSort}
                className="text-right"
              >
                Сумма USDT
              </SortableTh>
              <SortableTh
                field="commission"
                activeField={sortField}
                dir={sortDir}
                onClick={toggleSort}
                className="text-right"
              >
                Профит
              </SortableTh>
              <TableHead>Номер карты</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Способ</TableHead>
              <TableHead>Банк</TableHead>
              <TableHead>
                <span className="sr-only">Действия</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-muted/50">
                <TableCell>{tx.numericId}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 h-8 group"
                      >
                        <Badge
                          variant={STATUS_MAP[tx.status].variant}
                          className="group-hover:ring-2 group-hover:ring-ring"
                        >
                          {STATUS_MAP[tx.status].label}
                        </Badge>
                        <ChevronDown className="h-4 w-4 ml-1 opacity-70 group-hover:opacity-100" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      {STATUS_OPTIONS.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          disabled={s === tx.status}
                          onSelect={() => changeStatus(tx.id, s)}
                        >
                          {STATUS_MAP[s].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  {format(new Date(tx.createdAt), "d MMM yyyy HH:mm", {
                    locale: ru,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {tx.amount.toLocaleString("ru-RU", {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {toUsdt(tx).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {tx.commission.toFixed(2)}
                </TableCell>
                <TableCell>{tx.assetOrBank}</TableCell>
                <TableCell>{tx.clientName}</TableCell>
                <TableCell>{tx.method?.name ?? "-"}</TableCell>
                <TableCell>{tx.method?.type ?? "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOpenedTx(tx)}
                    aria-label="Подробнее"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Назад
        </Button>
        <span className="self-center text-sm select-none">
          {page} / {data.pagination.pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= data.pagination.pages}
          onClick={() => setPage(page + 1)}
        >
          Далее
        </Button>
      </div>

      {/* Details dialog */}
      <Dialog open={!!openedTx} onOpenChange={() => setOpenedTx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Транзакция #{openedTx?.numericId}</DialogTitle>
          </DialogHeader>
          {openedTx && (
            <div className="space-y-2 text-sm max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(openedTx).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between border-b py-1 last:border-none"
                >
                  <span className="font-medium mr-2 break-all max-w-[40%]">
                    {k}
                  </span>
                  <span className="text-right break-all max-w-[60%]">
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------------------------------------------------------
 *  Date popover component
 * ------------------------------------------------------------------------*/
interface DatePopoverProps {
  label: string;
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
}
const DatePopover: React.FC<DatePopoverProps> = ({ label, date, setDate }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-32 justify-between h-9">
        {date ? format(date, "dd.MM.yyyy") : `${label}`}
        <CalendarIcon className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="p-0" align="start">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        locale={ru}
        initialFocus
      />
      <div className="p-2 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
          Очистить
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);

/* --------------------------------------------------------------------------
 *  Sortable table header cell
 * ------------------------------------------------------------------------*/
interface SortableThProps
  extends React.HTMLAttributes<HTMLTableHeaderCellElement> {
  field: string;
  activeField: string;
  dir: "asc" | "desc";
  onClick: (field: string) => void;
}
const SortableTh: React.FC<SortableThProps> = ({
  field,
  activeField,
  dir,
  onClick,
  children,
  className,
}) => {
  const isActive = field === activeField;
  return (
    <TableHead
      onClick={() => onClick(field)}
      className={cn("cursor-pointer select-none", className)}
    >
      <div className="inline-flex items-center gap-1">
        {children}
        {isActive && (
          <ChevronsUpDown
            className={cn(
              "h-4 w-4 transition-transform",
              dir === "asc" ? "rotate-180" : "",
            )}
          />
        )}
      </div>
    </TableHead>
  );
};
