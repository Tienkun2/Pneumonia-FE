"use client";

import { useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { pushNotification, fetchUnreadCount } from "@/store/slices/notification-slice";
import { NotificationDto } from "@/services/notification-service";

const WS_URL = "http://localhost:8080/api/v1/ws";

export function useWebSockets() {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);
  const stompClientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!token || !isAuthenticated) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (msg) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[WS Debug]", msg);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // Helper: parse JSON if possible, otherwise treat as plain string
      const parseMessage = (body: string): NotificationDto => {
        try {
          const parsed = JSON.parse(body);
          // Validate it's actually a NotificationDto object
          if (parsed && typeof parsed === 'object' && parsed.content) {
            return parsed as NotificationDto;
          }
        } catch {
          // Not JSON - backend sent plain text
        }
        // Fallback: wrap plain text into a NotificationDto shape
        return {
          id: Date.now().toString(),
          content: body,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
      };

      // 1. Private User Notifications (all logged-in users)
      client.subscribe("/user/queue/notifications", (message) => {
        const notification = parseMessage(message.body);
        dispatch(pushNotification(notification));
        dispatch(fetchUnreadCount());
      });

      // 2. Admin Global Notifications
      const isAdmin = user?.roles?.some(role => role.name === 'ROLE_ADMIN');
      if (isAdmin) {
        client.subscribe("/topic/admin/notifications", (message) => {
          const notification = parseMessage(message.body);
          dispatch(pushNotification(notification));
          dispatch(fetchUnreadCount());
        });
      }
    };

    client.onStompError = (frame) => {
      console.error("[WS] STOMP error:", frame.body);
    };

    client.activate();
    stompClientRef.current = client;

  }, [token, isAuthenticated, dispatch, user]); // Added 'user' to ensure role-based subscriptions are accurate

  useEffect(() => {
    connect();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [connect]);

  return { isConnected: stompClientRef.current?.active };
}
