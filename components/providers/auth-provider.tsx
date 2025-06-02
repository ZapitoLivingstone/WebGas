"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
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
  const lastUserId = useRef<string | null>(null)
  const alreadyRefreshing = useRef(false)

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
    if (alreadyRefreshing.current) {
      console.log("[Auth] Ya refrescando, ignora nueva llamada")
      return
    }
    alreadyRefreshing.current = true
    setLoading(true)
    try {
      console.log("[Auth] Llamando supabase.auth.getSession()")
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.warn("[Auth] Error en getSession:", error)
      }
      const currentUser = session?.user ?? null
      console.log("[Auth] Estado de sesión:", session, currentUser)
      if (!currentUser) {
        setUser(null)
        setUserRole(null)
        lastUserId.current = null
        setLoading(false)
        setInitialLoading(false)
        alreadyRefreshing.current = false
        return
      }

      setUser(currentUser)
      if (lastUserId.current !== currentUser.id) {
        const role = await fetchUserRole(currentUser.id)
        setUserRole(role)
        lastUserId.current = currentUser.id
        console.log("[Auth] Usuario y rol seteados:", currentUser.email, role)
      } else {
        console.log("[Auth] Mismo usuario, no refresca rol")
      }
    } catch (e) {
      setUser(null)
      setUserRole(null)
      lastUserId.current = null
      console.error("[Auth] Error general en refreshAuth:", e)
    } finally {
      setLoading(false)
      setInitialLoading(false)
      alreadyRefreshing.current = false
    }
  }, [fetchUserRole])

  useEffect(() => {
    console.log("[Auth] useEffect: monta y llama refreshAuth")
    refreshAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Auth] Evento onAuthStateChange:", event, session)
      refreshAuth()
    })
    return () => {
      console.log("[Auth] Cleanup: unsubscribe onAuthStateChange")
      subscription.unsubscribe()
    }
  }, [refreshAuth])

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Cargando sesión...</div>
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log("[Auth] signOut llamado")
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
      lastUserId.current = null
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
