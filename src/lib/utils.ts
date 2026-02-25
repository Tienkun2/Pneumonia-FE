import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  dateInput: string | Date | undefined,
  format?: string
): string {
  try {
    if (!dateInput) return "-";

    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      if (format === "DD/MM/YYYY HH:mm") {
        return date.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    }

    return String(dateInput);
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(dateInput ?? "-");
  }
}
