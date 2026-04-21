import { cn } from "@/lib/utils";

/**
 * Common styles for UI components to ensure consistency across the application.
 * Values are based on a premium, clean, high-density clinical dashboard design.
 */

export const MODAL_STYLES = {
  /** Wrapper của DialogContent — responsive width */
  content: "w-[calc(100vw-2rem)] max-w-md rounded-2xl p-0 overflow-hidden border border-border/50 shadow-xl bg-background",
  /** Wide variant cho form nhiều field (bệnh nhân, ...) */
  contentWide: "w-[calc(100vw-2rem)] max-w-2xl rounded-2xl p-0 overflow-hidden border border-border/50 shadow-xl bg-background",
  /** Header phân tách bằng border, không dùng màu nền riêng */
  header: "px-6 py-5 border-b border-border text-left",
  /** Title: in hoa, bold, tracking chặt */
  title: "text-base font-bold uppercase tracking-wide text-foreground",
  /** Mô tả phụ bên dưới title */
  description: "text-sm text-muted-foreground mt-1",
  /** Body của form */
  body: "flex flex-col gap-5 px-6 py-5 bg-background",
  /** Body scrollable cho form dài */
  bodyWithScroll: "flex flex-col gap-5 px-6 py-5 bg-background max-h-[65vh] overflow-y-auto",
  /** Footer action buttons */
  footer: "flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30",
};

export const FORM_STYLES = {
  /** Label trên mỗi field */
  label: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
  /** Input bình thường */
  input: "h-10 text-sm",
  /** Input cho giá trị nổi bật (ID, code, username) */
  inputBold: "h-10 text-sm font-semibold",
  /** Nút xác nhận chính */
  buttonPrimary: "flex-1 font-semibold",
  /** Nút hủy phụ */
  buttonSecondary: "flex-1 font-semibold",
  /** Nút nguy hiểm */
  buttonDestructive: "flex-1 font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export const BADGE_STYLES = {
  root: "px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider whitespace-nowrap",
  variants: {
    default: "bg-primary/10 text-primary hover:bg-primary/20",
    secondary: "bg-muted/40 text-muted-foreground hover:bg-muted/60",
    destructive: "bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20",
    success: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 dark:text-amber-400 hover:bg-amber-500/20",
    info: "bg-sky-500/10 text-sky-500 dark:text-sky-400 hover:bg-sky-500/20",
    outline: "border border-border/60 bg-transparent text-foreground hover:bg-accent",
  }
};

export function getBadgeClass(variant: keyof typeof BADGE_STYLES.variants = "default", className?: string) {
  return cn(BADGE_STYLES.root, BADGE_STYLES.variants[variant], className);
}
