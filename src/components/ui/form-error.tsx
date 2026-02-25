import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
}

export const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
    ({ message, className, ...props }, ref) => {
        if (!message) return null;

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center gap-2 mt-1.5 text-sm font-medium text-destructive",
                    className
                )}
                {...props}
            >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{message}</span>
            </div>
        );
    }
);
FormError.displayName = "FormError";
