"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  markOneReadApi,
  markAllReadApi, 
  fetchNotifications,
  deleteOneApi,
  deleteAllApi
} from "@/store/slices/notification-slice";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Loader2,
  Check,
  Trash2,
  Clock,
} from "lucide-react";
import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NotificationsView() {
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount, isLoading, totalPages, currentPage } = useAppSelector((state) => state.notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const getTypeFromContent = (content: string) => {
    const lowercaseContent = content.toLowerCase();
    if (lowercaseContent.includes("pneumonia") || lowercaseContent.includes("nguy cơ cao") || lowercaseContent.includes("kết quả")) return 'warning';
    if (lowercaseContent.includes("tài khoản") || lowercaseContent.includes("khởi tạo") || lowercaseContent.includes("thành công")) return 'success';
    return 'info';
  };

  const getStatusColor = (type: string) => {
    switch(type) {
      case 'warning': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'success': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllReadApi());
  };

  const loadMore = () => {
    if (currentPage < totalPages) {
      dispatch(fetchNotifications(currentPage + 1));
    }
  };

  return (
    <div className="space-y-6 container mx-auto py-6 max-w-5xl animate-in fade-in duration-500">
      <PageHeader 
        title="Trung tâm thông báo"
        icon={Bell}
      >
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-4 rounded-xl font-bold gap-2 bg-card hover:bg-muted/50 border-border/40"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-3.5 w-3.5" />
            Đánh dấu đã đọc
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-4 rounded-xl font-bold gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            onClick={() => dispatch(deleteAllApi())}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa nhật ký
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/10 pb-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={filter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    "h-8 px-4 rounded-full font-black text-[10px] uppercase tracking-wider transition-all",
                    filter === 'all' ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setFilter('all')}
                >
                  Tất cả ({notifications.length})
                </Button>
                <Button
                  variant={filter === 'unread' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    "h-8 px-4 rounded-full font-black text-[10px] uppercase tracking-wider transition-all",
                    filter === 'unread' ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setFilter('unread')}
                >
                  Chưa đọc ({unreadCount})
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading && notifications.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-sm font-medium text-muted-foreground">Đang tải thông báo...</p>
               </div>
            ) : filteredNotifications.length === 0 ? (
               <div className="py-32 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/20">
                    <Bell className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-widest">Hộp thư đang trống</p>
                    <p className="text-xs text-muted-foreground">Bạn không có thông báo nào trong danh mục này.</p>
                  </div>
               </div>
            ) : (
               <div className="divide-y divide-border/10">
                 {filteredNotifications.map((notif) => {
                   const type = getTypeFromContent(notif.content);
                   const Icon = type === 'warning' ? AlertTriangle : (type === 'success' ? CheckCircle2 : Info);
                   
                   return (
                      <div 
                        key={notif.id}
                        className={cn(
                          "group flex items-start gap-4 p-5 transition-all relative",
                          !notif.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                         {!notif.read && (
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[2px_0_8px_rgba(37,99,235,0.4)]" />
                         )}
                         
                         <div 
                           className={cn(
                             "p-3 rounded-2xl border shrink-0 transition-transform cursor-pointer hover:scale-105",
                             getStatusColor(type)
                           )}
                           onClick={() => dispatch(markOneReadApi(notif.id))}
                         >
                            <Icon className="h-5 w-5" />
                         </div>

                         <div 
                           className="flex-1 space-y-1.5 min-w-0 py-1 cursor-pointer"
                           onClick={() => dispatch(markOneReadApi(notif.id))}
                         >
                            <div className="flex items-center justify-between gap-4">
                              <p className={cn(
                                "text-sm leading-relaxed",
                                notif.read ? "text-muted-foreground font-medium" : "text-foreground font-black"
                              )}>
                                {notif.content}
                              </p>
                              <div className="flex items-center gap-2">
                                {notif.read && (
                                  <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest bg-muted/20 border-border/30 text-muted-foreground font-bold">Đã xem</Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(deleteOneApi(notif.id));
                                  }}
                                >
                                   <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5 font-medium">
                                <Clock className="h-3 w-3" />
                                {notif.formattedTime}
                              </span>
                              {!notif.read && (
                                <Badge className="h-5 text-[9px] uppercase tracking-widest font-black shadow-sm">Mới</Badge>
                              )}
                            </div>
                         </div>
                      </div>
                   )
                 })}
               </div>
            )}
          </CardContent>
          
          {filter === 'all' && currentPage < totalPages && (
            <div className="p-6 bg-muted/5 border-t border-border/10 text-center">
               <Button
                 variant="outline"
                 onClick={loadMore}
                 disabled={isLoading}
                 className="rounded-full px-8 text-[11px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
               >
                 {isLoading ? <Loader2 className="h-3 h-3 animate-spin mr-2" /> : null}
                 Tải thêm dữ liệu
               </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
