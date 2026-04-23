"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { restoreSession, fetchMyInfo, setToken, logout } from "@/store/slices/auth-slice";
import { useWebSockets } from "@/hooks/use-websockets";
import { useDevices } from "@/hooks/use-devices";
import { fetchUnreadCount, fetchNotifications } from "@/store/slices/notification-slice";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAuthenticated, user, hasFetchedUser } = useAppSelector((state) => state.auth);

  // Security & Device Watcher (Auto-logout if revoked)
  useDevices();

  // Real-time Notifications via WebSocket
  useWebSockets();

  // Redirect if already authenticated and on an auth page
  useEffect(() => {
    // Only redirect if we have BOTH the Redux state AND the cookie
    // This avoids redirect loops when we are in the "pending trust" state on the login page
    const hasTokenCookie = typeof document !== "undefined" && document.cookie.includes("token=");

    if (isAuthenticated && hasTokenCookie && pathname?.startsWith("/auth") && !pathname?.startsWith("/auth/activate")) {
       router.push("/dashboard");
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && token && !user && !hasFetchedUser) {
      dispatch(fetchMyInfo());
    }
  }, [isAuthenticated, token, user, hasFetchedUser, dispatch]);

  // Fetch unread badge count and initial notifications on login
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications(1));
    }
  }, [isAuthenticated, token, dispatch]);

  // Sync Redux store with token refresh / forced logout from api-client
  useEffect(() => {
    const handleTokenRefreshed = (e: Event) => {
      const newToken = (e as CustomEvent<{ token: string }>).detail.token;
      dispatch(setToken(newToken));
    };

    const handleForceLogout = () => {
      dispatch(logout());
    };

    globalThis.window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    globalThis.window.addEventListener('auth:logout', handleForceLogout);

    return () => {
      globalThis.window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      globalThis.window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, [dispatch]);

  return <>{children}</>;
}
