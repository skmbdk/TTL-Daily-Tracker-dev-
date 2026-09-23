"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-[var(--text-primary)]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center border border-[var(--border-soft)] rounded-md transition-colors text-[var(--text-primary)]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-[var(--text-muted)] rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[var(--panel-soft)] [&:has([aria-selected])]:bg-[var(--panel-soft)] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[var(--hover-soft)] transition-colors rounded-md flex items-center justify-center text-[var(--text-primary)]"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-cyan-500 text-white hover:bg-cyan-600 focus:bg-cyan-600",
        day_today: "bg-[var(--panel-raised)] text-[var(--text-primary)] font-bold border border-[var(--border-soft)]",
        day_outside:
          "day-outside text-[var(--text-faint)] opacity-50 aria-selected:bg-[var(--panel-soft)] aria-selected:text-[var(--text-muted)]",
        day_disabled: "text-[var(--text-faint)] opacity-50",
        day_range_middle:
          "aria-selected:bg-[var(--panel-soft)] aria-selected:text-[var(--text-primary)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
