"use client";

import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDevices } from "@/hooks/use-devices";
import { UserDevice } from "@/utils/device-schemas";

interface TrustedDevicePromptProps {
  onComplete?: () => void;
  forcedShow?: boolean;
}

/**
 * TrustedDevicePrompt - Clean Minimalist Premium UI
 * Uses standard Project UI components
 */
export function TrustedDevicePrompt({ onComplete, forcedShow }: TrustedDevicePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { devices, isLoading, trustDevice } = useDevices(undefined, forcedShow);
  const [currentDevice, setCurrentDevice] = useState<UserDevice | null>(null);
  const completionCalled = useRef(false);

  const safeOnComplete = useCallback(() => {
    if (completionCalled.current) return;
    completionCalled.current = true;
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    // Trường hợp 1: Được yêu cầu hiển thị (vừa mới nhấn nút Đăng nhập xong)
    if (forcedShow && !isLoading && devices.length > 0) {
      const device = devices.find((d) => d.current);
      if (device) {
        // Luôn hiển thị bảng hỏi khi vừa login xong để người dùng quyết định 
        // có muốn "Duy trì đăng nhập" (Tin cậy) cho lần sau hay không.
        setCurrentDevice(device);
        setIsVisible(true);
      }
      return;
    }

    // Trường hợp 2: Kiểm tra thụ động (khi user vào trang web mà đã có session)
    if (forcedShow) return;
    if (typeof window !== "undefined" && sessionStorage.getItem("hide-trust-prompt") === "true") return;

    // Nếu đã có token bền vững (localStorage) thì coi như đã tin tưởng, không hỏi nữa
    const hasPersistentToken = typeof window !== "undefined" && !!localStorage.getItem("token");
    if (hasPersistentToken) return;

    if (!isLoading && devices.length > 0) {
      const device = devices.find((d) => d.current && !d.remembered);
      if (device) {
        setCurrentDevice(device);
        setIsVisible(true);
      }
    }
  }, [devices, isLoading, forcedShow, safeOnComplete]);

  const handleTrust = async () => {
    if (!currentDevice) {
      safeOnComplete();
      return;
    }
    try {
      await trustDevice(currentDevice.id);
      
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hide-trust-prompt", "true");
        const token = sessionStorage.getItem("token") || 
                     (typeof document !== "undefined" ? document.cookie.match(new RegExp('(^| )token=([^;]+)'))?.[2] : null);
        if (token) {
          localStorage.setItem("token", token);
          document.cookie = `token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        }
      }
      setIsVisible(false);
      safeOnComplete();
    } catch (error) {
    }
  };

  const handleIgnore = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hide-trust-prompt", "true");
      const token = sessionStorage.getItem("token") || 
                   (typeof document !== "undefined" ? document.cookie.match(new RegExp('(^| )token=([^;]+)'))?.[2] : null);
      if (token) {
        document.cookie = `token=${token}; path=/; SameSite=Lax`;
      }
    }
    setIsVisible(false);
    safeOnComplete();
  };

  if (!isVisible) return null;

  const hasToken = typeof window !== "undefined" && !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
  if (!hasToken && !forcedShow) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] w-[340px] animate-in slide-in-from-top-10 fade-in duration-500 ease-out">
      <Card className="shadow-2xl border-border bg-card/95 backdrop-blur-md rounded-2xl gap-0 py-0 overflow-hidden">
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-0 bg-transparent">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5">
                <Shield className="h-5 w-5" />
             </div>
             <CardTitle className="text-base font-black tracking-tight">Tin cậy thiết bị?</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground/40 hover:text-foreground rounded-lg" 
            onClick={handleIgnore}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardFooter className="p-5 pt-2 flex gap-3 border-0 bg-transparent">
          <Button 
            className="flex-1 rounded-xl font-bold h-10 transition-all active:scale-95 shadow-lg shadow-primary/20" 
            onClick={handleTrust}
          >
            Tin cậy
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 rounded-xl font-bold h-10 text-muted-foreground hover:bg-muted" 
            onClick={handleIgnore}
          >
            Bỏ qua
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
