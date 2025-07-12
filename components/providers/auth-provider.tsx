"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signOut: () => Promise<void>
  isConfigured: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  isConfigured: true,
  refreshAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", userId)
        .maybeSingle()
      if (error) {
        console.warn("[Auth] No se pudo leer el rol:", error)
        return null
      }
      return data?.rol ?? null
    } catch (err) {
      console.error("[Auth] Error al obtener rol:", err)
      return null
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      if (!currentUser) {
        setUser(null)
        setUserRole(null)
      } else {
        setUser(currentUser)
        // **Siempre** consulta el rol, aunque el id no cambie
        const role = await fetchUserRole(currentUser.id)
        setUserRole(role)
      }
    } catch (e) {
      setUser(null)
      setUserRole(null)
      console.error("[Auth] Error general en refreshAuth:", e)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [fetchUserRole])

  useEffect(() => {
    refreshAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshAuth()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [refreshAuth])

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Cargando sesión...</div>
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
      window.location.href = "/"
    } catch (error) {
      console.error("[Auth] Error durante signOut:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      signOut,
      isConfigured: true,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
