"use client";

import { UserDevice } from "@/utils/device-schemas";
import { Tablet, Smartphone, HelpCircle, LogOut, MapPin, Clock, Shield, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { DEVICE_STATUS, DEVICE_STATUS_MAP } from "@/constants/device";

interface DeviceItemProps {
  device: UserDevice;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function DeviceItem({ device, onDelete, isDeleting }: DeviceItemProps) {
  const getIcon = () => {
    switch (device.deviceType) {
      case "PC":
        return <Monitor className="h-6 w-6" />;
      case "MOBILE":
        return <Smartphone className="h-6 w-6" />;
      case "TABLET":
        return <Tablet className="h-6 w-6" />;
      default:
        return <HelpCircle className="h-6 w-6" />;
    }
  };

  const isRevoked = device.status === DEVICE_STATUS.REVOKED;
  const statusInfo = DEVICE_STATUS_MAP[device.status as keyof typeof DEVICE_STATUS_MAP] || DEVICE_STATUS_MAP[DEVICE_STATUS.ACTIVE];

  return (
    <div className={cn(
      "relative group flex flex-col p-5 rounded-[28px] border transition-all duration-300",
      "bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:bg-card hover:border-primary/20",
      isRevoked && "opacity-60 grayscale-[0.5]"
    )}>
      {/* Top Section: Icon & Status */}
      <div className="flex items-start justify-between mb-5">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
          isRevoked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary border border-primary/5 shadow-inner"
        )}>
          {getIcon()}
        </div>

        <div className="flex flex-col items-end gap-1.5">
           <Badge 
              variant={statusInfo.variant as "success" | "destructive"} 
              className="h-6 px-2.5 rounded-lg text-[10px] font-black"
           >
              {statusInfo.label.toUpperCase()}
           </Badge>
           
           {device.current && (
             <Badge variant="default" className="h-6 px-2.5 rounded-lg text-[10px] font-black bg-primary text-white border-none shadow-sm shadow-primary/20">
                THIẾT BỊ NÀY
             </Badge>
           )}
        </div>
      </div>

      {/* Middle Section: App Name & Meta */}
      <div className="space-y-3 mb-6">
        <h4 className="text-base font-black tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
          {device.appName}
        </h4>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-[13px] font-semibold text-muted-foreground/70">
            <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            {device.ipAddress}
          </div>
          <div className="flex items-center gap-2.5 text-[13px] font-semibold text-muted-foreground/70">
            <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
            {formatDate(device.lastAccess, "DD/MM/YYYY HH:mm")}
          </div>
        </div>
      </div>

      {/* Bottom Section: Actions & Tags */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
        </div>

        {!isRevoked && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 rounded-xl font-bold text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all gap-2"
                disabled={isDeleting}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-[12px]">THU HỒI</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[32px] border-border shadow-2xl p-8 max-w-[400px]">
              <DialogHeader className="gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-2">
                   <Shield className="h-8 w-8" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight text-center">
                   Xác nhận thu hồi?
                </DialogTitle>
                <DialogDescription className="text-center font-semibold text-muted-foreground/80 leading-relaxed">
                  Thiết bị này sẽ không còn được <span className="text-red-500 font-bold underline underline-offset-4">tin cậy</span> và mọi phiên đăng nhập sẽ bị vô hiệu hóa ngay lập tức.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                <DialogClose asChild>
                  <Button variant="ghost" className="flex-1 rounded-2xl font-bold h-12 text-muted-foreground hover:bg-muted">
                    Để sau
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={() => onDelete(device.id)}
                    className="flex-1 rounded-2xl font-bold h-12 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                  >
                    Đồng ý thu hồi
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
