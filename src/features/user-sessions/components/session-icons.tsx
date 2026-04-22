import { Smartphone, Monitor, Tablet, HelpCircle, Chrome, Compass, Globe, Info } from "lucide-react";
import React from "react";

export const getDeviceIcon = (deviceType?: string) => {
  if (!deviceType) return <HelpCircle className="h-4 w-4 text-muted-foreground/40" />;
  
  switch (deviceType.toUpperCase()) {
    case "PC":
      return <Monitor className="h-4 w-4" />;
    case "MOBILE":
      return <Smartphone className="h-4 w-4" />;
    case "TABLET":
      return <Tablet className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

export const getBrowserIcon = (appName?: string) => {
  if (!appName) return <Globe className="h-4 w-4 text-muted-foreground/40" />;
  
  const name = appName.toLowerCase();
  if (name.includes("chrome")) return <Chrome className="h-4 w-4 text-blue-500" />;
  if (name.includes("edge")) return <Globe className="h-4 w-4 text-blue-600" />;
  if (name.includes("safari")) return <Compass className="h-4 w-4 text-sky-500" />;
  if (name.includes("firefox")) return <Globe className="h-4 w-4 text-orange-500" />;
  return <Info className="h-4 w-4 text-muted-foreground" />;
};
