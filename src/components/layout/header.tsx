"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutThunk } from "@/store/slices/auth-slice";
import { markOneReadApi, markAllReadApi } from "@/store/slices/notification-slice";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Check,
  Menu
} from "lucide-react";

export function Header({ isCollapsed, setIsCollapsed }: { isCollapsed?: boolean; setIsCollapsed?: (val: boolean) => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useAppSelector((state) => state.notifications);

  const getTypeFromContent = (content: string) => {
    if (content.toLowerCase().includes("pneumonia") || content.toLowerCase().includes("nguy cơ cao") || content.toLowerCase().includes("kết quả")) return 'warning';
    if (content.toLowerCase().includes("tài khoản") || content.toLowerCase().includes("khởi tạo") || content.toLowerCase().includes("thành công")) return 'success';
    return 'info';
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle2;
      default: return Bell;
    }
  };

  const getColorForType = (type: string) => {
    switch(type) {
      case 'warning': return "text-amber-500 bg-amber-500/10";
      case 'success': return "text-emerald-500 bg-emerald-500/10";
      default: return "text-primary bg-primary/10";
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-2 lg:gap-4">
        {/* Mobile Menu Spacer */}
        <div className="w-16 lg:hidden shrink-0" />

        {/* Desktop Sidebar Toggle */}
        <Button 
          variant="outline" 
          size="icon" 
          className="hidden lg:flex text-muted-foreground hover:text-primary hover:bg-primary/10 border-border/50 rounded-xl bg-card shadow-sm shrink-0" 
          onClick={() => setIsCollapsed?.(!isCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Search Bar */}
        <div className="relative w-full max-w-md hidden lg:block group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
          type="text"
          placeholder="Search anything here..."
          className="h-11 w-full rounded-full border border-border/50 bg-card pl-11 pr-4 text-sm focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm font-medium cursor-pointer placeholder:text-muted-foreground/50"
          readOnly
          onClick={() => {
             const event = new KeyboardEvent('keydown', {
               key: 'k',
               ctrlKey: true,
               bubbles: true
             });
             document.dispatchEvent(event);
          }}
        />
      </div>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-11 w-11 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-full border border-border/50 bg-card shadow-sm">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-background"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden mt-2" align="end">
             <div className="bg-primary text-primary-foreground p-4">
                <div className="flex items-center justify-between">
                   <h3 className="font-bold text-sm">Thông báo</h3>
                   <div className="flex items-center gap-2">
                     {unreadCount > 0 && (
                       <Badge className="bg-white/10 text-white border-white/20 text-[10px] uppercase tracking-wider">{unreadCount > 99 ? '99+' : `Mới (${unreadCount})`}</Badge>
                     )}
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
                      onClick={() => dispatch(markAllReadApi())}
                      title="Đánh dấu tất cả đã đọc"
                    >
                        <Check className="h-3.5 w-3.5" />
                     </Button>
                   </div>
                </div>
             </div>
             <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground/50">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-medium">Bạn chưa có thông báo nào</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => {
                    const Icon = getIconForType(getTypeFromContent(notif.content));
                    const colorClasses = getColorForType(getTypeFromContent(notif.content));
                    return (
                        <div 
                          key={notif.id} 
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border flex gap-3 relative ${!notif.isRead ? 'bg-primary/5' : ''}`}
                          onClick={() => dispatch(markOneReadApi(notif.id))}
                        >
                           <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${colorClasses}`}>
                              <Icon className="h-5 w-5" />
                           </div>
                           <div className="space-y-1 flex-1 min-w-0">
                              <p className={`text-sm leading-tight truncate ${notif.isRead ? 'text-muted-foreground font-medium' : 'text-foreground font-black'}`}>
                                {notif.content}
                              </p>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                 <Clock className="h-2.5 w-2.5" /> {notif.formattedTime}
                              </span>
                           </div>
                           {!notif.isRead && (
                             <span className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-primary" />
                           )}
                        </div>
                    )
                  })
                )}
             </div>
              <div className="p-3 bg-muted/50 text-center border-t border-border">
                 <Button variant="link" className="text-xs text-primary font-bold p-0" onClick={() => router.push("/notifications")}>Xem tất cả thông báo</Button>
              </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 w-11 rounded-full p-0 hover:bg-muted/50 transition-all border border-border/50 bg-card shadow-sm shrink-0 flex items-center justify-center overflow-hidden"
            >
              <Avatar className="h-full w-full border-none shadow-none">
                <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl p-2 border border-border bg-card shadow-2xl mt-2 animate-in fade-in zoom-in-95"
          >
            <DropdownMenuLabel className="px-3 py-4 flex flex-col items-center gap-2 border-b border-border mb-1">
               <Avatar className="h-14 w-14 border shadow-sm">
                  <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                  <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div className="text-center">
                  <p className="font-black text-foreground">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground font-medium">{user?.email}</p>
               </div>
            </DropdownMenuLabel>
            
            <DropdownMenuItem
              className="gap-3 rounded-xl p-3 focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors"
              onClick={() => router.push("/profile")}
            >
              <User className="h-4 w-4" />
              <span className="font-bold">Hồ sơ cá nhân</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="gap-3 rounded-xl p-3 focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4" />
              <span className="font-bold">Cài đặt hệ thống</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border mx-2 my-1" />
            
            <DropdownMenuItem
              className="gap-3 rounded-xl p-3 text-red-500 focus:bg-red-500/10 focus:text-red-600 cursor-pointer transition-colors font-bold"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="font-bold">Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
