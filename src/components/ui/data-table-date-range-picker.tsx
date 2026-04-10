"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DataTableDateRangePickerProps {
  readonly date: DateRange | undefined;
  readonly onDateChange: (date: DateRange | undefined) => void;
  readonly className?: string;
  readonly placeholder?: string;
}

export function DataTableDateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = "Chọn ngày",
}: DataTableDateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "h-9 rounded-xl gap-2 font-bold border-border/50 bg-card shadow-sm hidden lg:flex"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {(() => {
              if (!date?.from) return <span>{placeholder}</span>;
              if (date.to) {
                return (
                  <>
                    {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                    {format(date.to, "dd/MM/yyyy", { locale: vi })}
                  </>
                );
              }
              return format(date.from, "dd/MM/yyyy", { locale: vi });
            })()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={1}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
