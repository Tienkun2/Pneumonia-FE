"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { restoreSession, fetchMyInfo } from "@/store/slices/auth-slice";
import { useWebSockets } from "@/hooks/use-websockets";
import { fetchUnreadCount, fetchNotifications } from "@/store/slices/notification-slice";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  // Real-time Notifications via WebSocket
  useWebSockets();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && token && !user && !isLoading) {
      dispatch(fetchMyInfo());
    }
  }, [isAuthenticated, token, user, isLoading, dispatch]);

  // Fetch unread badge count and initial notifications on login
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications(1));
    }
  }, [isAuthenticated, token, dispatch]);

  return <>{children}</>;
}
