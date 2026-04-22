"use client";

import { UserDevice } from "@/utils/device-schemas";
import { Laptop, Tablet, Smartphone, HelpCircle, LogOut, MapPin, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";
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

interface DeviceItemProps {
  device: UserDevice;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function DeviceItem({ device, onDelete, isDeleting }: DeviceItemProps) {
  const getIcon = () => {
    switch (device.deviceType) {
      case "PC":
        return <Laptop className="h-5 w-5" />;
      case "MOBILE":
        return <Smartphone className="h-5 w-5" />;
      case "TABLET":
        return <Tablet className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card/40 hover:bg-card/80 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
          {getIcon()}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">{device.appName}</h4>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight",
                device.status === "Bị thu hồi" 
                  ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                  : "bg-emerald-500/10 text-emerald-500"
              )}>
                {device.status}
              </span>
              {device.remembered && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-tight border border-blue-500/20">
                  <Shield className="h-2.5 w-2.5" />
                  Thiết bị tin cậy
                </span>
              )}
              {device.current && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tight border border-primary/20">
                  Thiết bị này
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 opacity-50" /> {device.ipAddress}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 opacity-50" /> 
              {formatDate(device.lastAccess, "DD/MM/YYYY HH:mm")}
            </span>
          </div>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors h-10 w-10 flex-shrink-0"
            disabled={isDeleting}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-2xl border-border shadow-2xl p-6">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <Shield className="h-5 w-5" />
               </div>
               Thu hồi thiết bị?
            </DialogTitle>
            <DialogDescription className="font-semibold text-muted-foreground/80 leading-relaxed">
              Bạn có chắc chắn muốn <span className="text-red-500 font-bold">thu hồi</span> quyền truy cập của thiết bị này? 
              Thiết bị sẽ không còn được tin cậy và mọi phiên đăng nhập tự động sẽ bị vô hiệu hóa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-xl font-bold text-muted-foreground hover:bg-muted min-w-[100px]">
                Hủy bỏ
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                onClick={() => onDelete(device.id)}
                className="rounded-xl font-bold bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 px-6"
              >
                Xác nhận thu hồi
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
