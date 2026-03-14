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

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(withAuth && token && { Authorization: `Bearer ${token}` }),
      ...(fetchOptions.headers || {})
    }
  })

  return res
}