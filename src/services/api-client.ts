const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://pneumonia-backend-1-0.onrender.com/api/v1"

type ApiOptions = RequestInit & {
  withAuth?: boolean
}

export const apiClient = async (
  endpoint: string,
  options: ApiOptions = {}
) => {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  const { withAuth = true, ...fetchOptions } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(withAuth && token && { Authorization: `Bearer ${token}` }),
    ...(fetchOptions.headers || {})
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  })

  // Handle 401 Unauthorized — attempt token refresh
  if (res.status === 401 && withAuth && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
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
                localStorage.setItem("token", newToken);
                document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
             }
             
             // Retry original request with new token
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
    
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        document.cookie = "token=; Max-Age=0; path=/";
        window.dispatchEvent(new Event('auth:logout'));
        window.location.href = "/login";
    }
  }

  return res
}