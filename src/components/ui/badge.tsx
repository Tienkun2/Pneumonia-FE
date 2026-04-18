import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "bg-muted/40 text-muted-foreground hover:bg-muted/60",
        destructive:
          "bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20",
        success: 
          "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20",
        warning: 
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
        info: 
          "bg-sky-500/10 text-sky-500 dark:text-sky-400 hover:bg-sky-500/20",
        outline: "border border-border/60 bg-transparent text-foreground hover:bg-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
