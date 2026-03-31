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

  // Determine type from content heuristic (since API doesn't return type)
  const getTypeFromContent = (content: string) => {
    if (content.toLowerCase().includes("pneumonia") || content.toLowerCase().includes("nguy cơ cao")) return 'warning';
    if (content.toLowerCase().includes("tài khoản") || content.toLowerCase().includes("khởi tạo")) return 'success';
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

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      {/* Minimal action bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
           <Bell className="h-4 w-4 text-slate-400" />
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
             {unreadCount} chưa đọc
           </span>
           {isLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-300" />}
        </div>
        
        <div className="flex items-center gap-6">
           <button 
             onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
             className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filter === 'unread' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
           >
             {filter === 'all' ? 'Chưa đọc' : 'Tất cả'}
           </button>
           <button 
             onClick={handleMarkAllRead}
             className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
           >
             Đã đọc hết
           </button>
           <button 
             onClick={() => dispatch(clearNotifications())}
             className="text-[10px] font-black text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest"
           >
             Làm sạch
           </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="space-y-1">
        {isLoading && notifications.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-200 mx-auto" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-32 text-center text-slate-300">
            <p className="text-xs font-medium italic">Hộp thư thông báo đang trống</p>
          </div>
        ) : (
          <>
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`group flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer hover:bg-slate-50/80 ${notif.isRead ? '' : 'bg-blue-50/20'}`}
                onClick={() => dispatch(markOneReadApi(notif.id))}
              >
                <div className="mt-1 shrink-0">
                  {getIcon(getTypeFromContent(notif.content))}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm truncate ${notif.isRead ? 'text-slate-500' : 'text-slate-900 font-bold'}`}>
                      {notif.content}
                    </p>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tabular-nums whitespace-nowrap">
                      {notif.formattedTime}
                    </span>
                  </div>
                </div>
                {!notif.isRead && (
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                )}
              </div>
            ))}

            {/* Load more */}
            {filter === 'all' && currentPage < totalPages && (
              <div className="pt-4 text-center">
                <button
                  onClick={loadMore}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                >
                  Tải thêm
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
