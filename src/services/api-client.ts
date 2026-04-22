import { toast } from "sonner";

declare global {
  interface Window {
    isHandling401?: boolean;
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1"

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

type ApiOptions = RequestInit & {
  withAuth?: boolean
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiClient = async (
  endpoint: string,
  options: ApiOptions = {}
) => {

  let token = typeof window !== "undefined" 
    ? (localStorage.getItem("token") || sessionStorage.getItem("token")) 
    : null;
  
  // Fallback to cookie if localStorage is empty (for session-only auth)
  if (!token && typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    if (match) token = match[2];
  }

  const { withAuth = true, ...fetchOptions } = options
  const isFormData = fetchOptions.body instanceof FormData;

  const headers: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(withAuth && token && { Authorization: `Bearer ${token}` }),
    ...(fetchOptions.headers || {})
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  })

  // Handle 401 Unauthorized — attempt token refresh
  if (res.status === 401 && withAuth && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    if (isRefreshing) {
      return new Promise<Response>((resolve) => {
        subscribeTokenRefresh(async (newToken) => {
          const retryRes = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            }
          });
          resolve(retryRes);
        });
      });
    }

    isRefreshing = true;

    try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const refreshData = await refreshRes.json();

        if (refreshData.code === 0 && refreshData.result?.token) {
             const newToken = refreshData.result.token;
             if (typeof window !== "undefined") {
                const isPersistent = !!localStorage.getItem("token");
                if (isPersistent) {
                  localStorage.setItem("token", newToken);
                  document.cookie = `token=${newToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
                } else {
                  sessionStorage.setItem("token", newToken);
                  document.cookie = `token=${newToken}; path=/; SameSite=Lax`;
                }
             }
             
             isRefreshing = false;
             onRefreshed(newToken);

             // Notify the rest of the app (Redux) about the new token
             if (typeof window !== "undefined") {
                 window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { token: newToken } }));
             }
             
             res = await fetch(`${API_URL}${endpoint}`, {
                 ...fetchOptions,
                 headers: {
                     ...headers,
                     Authorization: `Bearer ${newToken}`,
                 }
             });
             return res;
        }
    } catch (e) {
       console.error("Token refresh failed", e);
    }
    
    isRefreshing = false;
    refreshSubscribers = [];

    if (typeof window !== "undefined" && !window.isHandling401) {
        window.isHandling401 = true;
        toast.error("Phiên làm việc đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        document.cookie = "token=; Max-Age=0; path=/";
        // Notify Redux to clear state
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Trì hoãn việc chuyển hướng một chút để user kịp đọc thông báo
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.isHandling401 = false;
            window.location.href = "/auth/login";
          }
        }, 1500);
    }
  }

  return res
}

/**
 * High-level API helpers for a more senior and maintainable code
 */
export const api = {
    get: <T>(endpoint: string, options?: ApiOptions) => 
        apiClient(endpoint, { ...options, method: 'GET' }).then(async r => {
            const data = await r.json() as ApiResponse<T>;
            if (data.code !== 0) throw new Error(data.message || 'API Error');
            return data.result;
        }),
        
    post: <T>(endpoint: string, body: unknown, options?: ApiOptions) => 
        apiClient(endpoint, { 
            ...options, 
            method: 'POST', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        }).then(async r => {
            const data = await r.json() as ApiResponse<T>;
            if (data.code !== 0) throw new Error(data.message || 'API Error');
            return data.result;
        }),
        
    put: <T>(endpoint: string, body: unknown, options?: ApiOptions) => 
        apiClient(endpoint, { 
            ...options, 
            method: 'PUT', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        }).then(async r => {
            const data = await r.json() as ApiResponse<T>;
            if (data.code !== 0) throw new Error(data.message || 'API Error');
            return data.result;
        }),
        
    delete: <T>(endpoint: string, options?: ApiOptions) => 
        apiClient(endpoint, { ...options, method: 'DELETE' }).then(async r => {
            const data = await r.json() as ApiResponse<T>;
            if (data.code !== 0) throw new Error(data.message || 'API Error');
            return data.result;
        }),

    patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) => 
        apiClient(endpoint, { 
            ...options, 
            method: 'PATCH', 
            body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined
        }).then(async r => {
            const data = await r.json() as ApiResponse<T>;
            if (data.code !== 0) throw new Error(data.message || 'API Error');
            return data.result;
        }),
}
