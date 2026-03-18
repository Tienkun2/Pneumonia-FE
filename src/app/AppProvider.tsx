"use client"

import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import { store, AppDispatch } from "@/store/store"
import { restoreSession, logout } from "@/store/slices/auth-slice"
import { useRouter } from "next/navigation"

function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  useEffect(() => {
    dispatch(restoreSession())

    const handleAuthLogout = () => {
      dispatch(logout())
      router.push("/auth/login")
    }

    window.addEventListener("auth:logout", handleAuthLogout)

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout)
    }
  }, [dispatch, router])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  )
}