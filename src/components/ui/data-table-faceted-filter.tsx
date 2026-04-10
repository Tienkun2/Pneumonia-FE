"use client";

import * as React from "react";
import { Check, PlusCircle, Search } from "lucide-react";
import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DataTableFacetedFilterProps<TData, TValue> {
  readonly column?: Column<TData, TValue>;
  readonly title?: string;
  readonly options: {
    readonly label: string;
    readonly value: string;
    readonly icon?: React.ComponentType<{ readonly className?: string }>;
  }[];
  readonly searchable?: boolean;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  searchable = true,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 rounded-xl gap-2 text-[13px] font-bold border-border/50 bg-card shadow-sm hidden lg:flex">
          <PlusCircle className="h-3.5 w-3.5" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <DropdownMenuSeparator className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[210px] rounded-xl shadow-xl border-border/60 p-1">
        {searchable && (
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder={`Tìm ${title?.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-[11px] rounded-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        )}
        {searchable && <DropdownMenuSeparator className="opacity-40" />}
        <div className="max-h-[300px] overflow-y-auto p-1 space-y-0.5">
          {filteredOptions.map((option) => {
            const isSelected = selectedValues.has(option.value);
            return (
              <DropdownMenuItem
                key={option.value}
                onSelect={(e) => {
                  e.preventDefault();
                  if (isSelected) {
                    selectedValues.delete(option.value);
                  } else {
                    selectedValues.add(option.value);
                  }
                  const filterValues = Array.from(selectedValues);
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined
                  );
                }}
                className="flex items-center gap-2 cursor-pointer rounded-lg py-1.5 px-2 hover:bg-muted/60"
              >
                <div
                  className={cn(
                    "mr-1 flex h-4 w-4 items-center justify-center rounded-full border border-primary/40 transition-all",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground scale-110 shadow-sm shadow-primary/20"
                      : "opacity-40 [&_svg]:invisible"
                  )}
                >
                  <Check className={cn("h-2.5 w-2.5 stroke-[4]")} />
                </div>
                {option.icon && (
                  <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-[13px] font-bold text-foreground pr-2">{option.label}</span>
              </DropdownMenuItem>
            );
          })}
        </div>
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator className="opacity-40" />
            <DropdownMenuItem
              onSelect={() => column?.setFilterValue(undefined)}
              className="justify-center text-center font-semibold text-[12px] text-muted-foreground/80 hover:text-primary cursor-pointer py-2 rounded-lg mt-1 border-t border-border/40"
            >
              Đặt lại
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
