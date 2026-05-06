import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export interface AddButtonProps extends ButtonProps {
  label: string;
}

export const AddButton = React.forwardRef<HTMLButtonElement, AddButtonProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "gap-1.5 h-9 px-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all font-semibold text-[13px]",
          className
        )}
        {...props}
      >
        <Plus className="h-4 w-4" /> Thêm {label.toLowerCase()}
      </Button>
    );
  }
);
AddButton.displayName = "AddButton";
