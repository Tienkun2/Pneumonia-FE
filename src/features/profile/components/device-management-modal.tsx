"use client";

import { useDevices } from "@/hooks/use-devices";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Monitor, Smartphone, Laptop, Globe, Clock, ShieldAlert
} from "lucide-react";

interface DeviceManagementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deviceCount: number;
}

export function DeviceManagementModal({ isOpen, onOpenChange, deviceCount }: DeviceManagementModalProps) {
  const { devices, isLoading, revokeDevice } = useDevices();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span className="font-bold text-primary underline cursor-pointer hover:text-primary/80 transition-colors">
          {deviceCount} thiết bị
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-border bg-card">
        <DialogHeader className="p-6 pb-4 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Thiết bị của bạn</DialogTitle>
              <DialogDescription className="text-xs">
                Danh sách các thiết bị đã đăng nhập vào tài khoản này
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-xs text-muted-foreground font-medium">Đang tải danh sách...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground italic text-sm">
              Chưa có thiết bị nào được ghi nhận
            </div>
          ) : (
            devices.map((device) => (
              <div 
                key={device.id} 
                className={`group flex items-center justify-between p-4 rounded-xl border border-transparent transition-all hover:bg-muted/50 hover:border-border ${device.current ? 'bg-primary/5 border-primary/20 shadow-sm' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg border shadow-sm ${device.current ? 'bg-primary text-white border-primary' : 'bg-background border-border text-muted-foreground'}`}>
                    {device.deviceType === 'PC' ? <Laptop className="h-5 w-5" /> : 
                     device.deviceType === 'MOBILE' ? <Smartphone className="h-5 w-5" /> : 
                     <Globe className="h-5 w-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{device.appName}</p>
                      {device.current && (
                        <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(device.lastAccess), { addSuffix: true, locale: vi })}</span>
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {device.ipAddress}</span>
                    </div>
                  </div>
                </div>

                {!device.current && device.status === 'ACTIVE' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    onClick={() => revokeDevice(device.id)}
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-muted/20 border-t border-border">
          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            Nếu bạn thấy thiết bị lạ, hãy thu hồi quyền truy cập và đổi mật khẩu ngay lập tức.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
