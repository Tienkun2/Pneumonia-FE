import React from "react";
import * as LucideIcons from "lucide-react";
import { CircleDot } from "lucide-react";

interface DynamicIconProps {
  name?: string;
  className?: string;
}

export const DynamicIcon = React.memo(({ name, className }: DynamicIconProps) => {
  const iconName = name as keyof typeof LucideIcons;
  const Icon = (LucideIcons[iconName] as React.ElementType) ?? CircleDot;
  return <Icon className={className} />;
});

DynamicIcon.displayName = "DynamicIcon";
