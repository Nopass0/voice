/* --------------------------------------------------------------
   /components/DateRangePicker.tsx
-------------------------------------------------------------- */
"use client";

import React from "react";
import { DateRange } from "date-fns";
import { addDays, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Props = {
  value: DateRange | undefined;
  onChange: (v: DateRange | undefined) => void;
};

export const DateRangePicker: React.FC<Props> = ({ value, onChange }) => {
  const presets: { label: string; range?: DateRange }[] = [
    { label: "Всё время" },
    {
      label: "Сегодня",
      range: {
        from: startOfDay(new Date()),
        to: new Date(),
      },
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
        <Button variant="outline" size="sm">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 space-y-2">
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
};
