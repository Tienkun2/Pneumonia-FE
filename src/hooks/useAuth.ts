import { useDispatch } from "react-redux"
import { login as loginThunk, logout } from "@/store/slices/auth-slice"
import type { AppDispatch } from "@/store/store"

export const useAuth = () => {

  const dispatch = useDispatch<AppDispatch>()

  const login = async (username: string, password: string) => {

    await dispatch(loginThunk({ username, password }))
  }

  const signOut = () => {
    dispatch(logout())
  }

  return {
    login,
    signOut
  }
}