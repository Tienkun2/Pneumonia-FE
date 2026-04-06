"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  markOneReadApi,
  markAllReadApi, 
  clearNotifications,
  fetchNotifications,
} from "@/store/slices/notification-slice";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";

export function NotificationsView() {
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount, isLoading, totalPages, currentPage } = useAppSelector((state) => state.notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const getIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeFromContent = (content: string) => {
    const lowercaseContent = content.toLowerCase();
    if (lowercaseContent.includes("pneumonia") || lowercaseContent.includes("nguy cơ cao")) return 'warning';
    if (lowercaseContent.includes("tài khoản") || lowercaseContent.includes("khởi tạo")) return 'success';
    return 'info';
  };

  const handleMarkAllRead = () => {
    dispatch(markAllReadApi());
  };

  const loadMore = () => {
    if (currentPage < totalPages) {
      dispatch(fetchNotifications(currentPage + 1));
    }
  };

  let content;
  if (isLoading && notifications.length === 0) {
    content = (
      <div className="py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  } else if (filteredNotifications.length === 0) {
    content = (
      <div className="py-32 text-center text-muted-foreground border-border border rounded-[2rem] bg-muted/20">
        <p className="text-xs font-semibold italic uppercase tracking-widest opacity-50">Hộp thư thông báo đang trống</p>
      </div>
    );
  } else {
    content = (
      <>
        {filteredNotifications.map((notif) => (
          <button 
            key={notif.id}
            className={`group flex w-full items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer text-left hover:bg-muted/80 ${notif.isRead ? 'opacity-70' : 'bg-primary/5 shadow-sm'}`}
            onClick={() => dispatch(markOneReadApi(notif.id))}
          >
            <div className="mt-1 shrink-0 p-2 bg-background rounded-xl border border-border shadow-sm group-hover:bg-primary/5 transition-colors">
              {getIcon(getTypeFromContent(notif.content))}
            </div>
            <div className="flex-1 min-w-0 space-y-1 py-1">
              <div className="flex items-center justify-between gap-4">
                 <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-muted-foreground' : 'text-foreground font-bold'}`}>
                   {notif.content}
                 </p>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-muted-foreground/40 uppercase tabular-nums tracking-widest">
                   {notif.formattedTime}
                 </span>
                 {!notif.isRead && <span className="text-[10px] font-black text-primary uppercase tracking-widest">Mới</span>}
               </div>
             </div>
             {!notif.isRead && (
               <div className="mt-4 h-2 w-2 rounded-full bg-primary shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.6)]" />
             )}
          </button>
        ))}

        {filter === 'all' && currentPage < totalPages && (
          <div className="pt-6 text-center">
             <button
               onClick={loadMore}
               className="px-6 py-2 rounded-full border border-border text-[10px] font-black text-primary hover:bg-primary/5 uppercase tracking-widest transition-all"
             >
               Tải thêm thông báo
             </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <PageHeader 
        title="Thông báo"
        icon={Bell}
        description={`${unreadCount} thông báo chưa đọc`}
      >
        <div className="flex items-center gap-4">
            <button 
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filter === 'unread' ? 'text-primary underline underline-offset-8' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {filter === 'all' ? 'Chưa đọc' : 'Tất cả'}
            </button>
            <button 
              onClick={handleMarkAllRead}
              className="text-[10px] font-black text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Đã đọc hết
            </button>
            <button 
              onClick={() => dispatch(clearNotifications())}
              className="text-[10px] font-black text-muted-foreground/30 hover:text-destructive transition-colors uppercase tracking-widest"
            >
              Làm sạch
            </button>
        </div>
      </PageHeader>

      <div className="space-y-3">
        {content}
      </div>
    </div>
  );
}
