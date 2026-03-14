"use client"

import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import { store, AppDispatch } from "@/store/store"
import { restoreSession } from "@/store/slices/auth-slice"

function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

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