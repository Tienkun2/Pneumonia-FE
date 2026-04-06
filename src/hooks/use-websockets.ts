"use client";

import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, StompSubscription } from "@stomp/stompjs";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { pushNotification, fetchUnreadCount } from "@/store/slices/notification-slice";
import { NotificationDto } from "@/services/notification-service";

const WS_URL = "http://localhost:8080/api/v1/ws";

export function useWebSockets() {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);

  // Stable Client Initialization
  useEffect(() => {
    if (!token || !isAuthenticated) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (msg) => {
        if (process.env.NODE_ENV === "development") console.log("[WS Debug]", msg);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("[WS] Connected");
    };

    client.onStompError = (frame) => {
      console.error("[WS] STOMP error:", frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [token, isAuthenticated]); // Only reconnect if token or auth state changes

  // Subscription Management (Decoupled from connection lifecycle)
  useEffect(() => {
    const client = stompClientRef.current;
    if (!client || !isAuthenticated) return;

    // Local subscription logic
    const subscribe = () => {
      // Helper: parse JSON if possible, otherwise treat as plain string
      const parseMessage = (body: string): NotificationDto => {
        try {
          const parsed = JSON.parse(body);
          if (parsed && typeof parsed === 'object' && parsed.content) return parsed as NotificationDto;
        } catch {}
        return {
          id: Date.now().toString(),
          content: body,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
      };

      // Clear previous subscriptions
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];

      const subs: StompSubscription[] = [];

      // 1. Private User Notifications
      subs.push(client.subscribe("/user/queue/notifications", (message) => {
        dispatch(pushNotification(parseMessage(message.body)));
        dispatch(fetchUnreadCount());
      }));

      // 2. Admin Global Notifications
      const isAdmin = user?.roles?.some(role => role.name === 'ROLE_ADMIN');
      if (isAdmin) {
        subs.push(client.subscribe("/topic/admin/notifications", (message) => {
          dispatch(pushNotification(parseMessage(message.body)));
          dispatch(fetchUnreadCount());
        }));
      }

      subscriptionsRef.current = subs;
    };

    // If already connected, subscribe immediately
    if (client.connected) {
      subscribe();
    } else {
      // Otherwise wait for connection
      const originalOnConnect = client.onConnect;
      client.onConnect = (frame) => {
        if (originalOnConnect) originalOnConnect(frame);
        subscribe();
      };
    }

    return () => {
      // No need to clear subscriptions if the client is deactivating anyway,
      // but clean up references to be safe
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [isAuthenticated, user, dispatch]); // Role changes will refresh subscriptions without killing the connection

  return { isConnected: stompClientRef.current?.connected };
}
