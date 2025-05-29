"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signOut: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  isConfigured: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carga inicial de sesión y rol
    const loadSessionAndRole = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          setUser(null)
          setUserRole(null)
          return
        }

        setUser(session.user)
        // Lectura de rol con maybeSingle para evitar errores 406
        const { data: profile, error: roleError } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id", session.user.id)
          .maybeSingle()

        if (roleError) console.warn("No se pudo leer el rol inicial:", roleError)
        setUserRole(profile?.rol ?? null)
      } catch (err) {
        console.error("Error cargando sesión y rol:", err)
        setUser(null)
        setUserRole(null)
      } finally {
        setLoading(false)
      }
    }

    loadSessionAndRole()

    // Suscripción a cambios de auth sin alterar loading
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profile, error } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id", session.user.id)
          .maybeSingle()
        if (error) console.warn("No se pudo leer el rol tras cambio de estado:", error)
        setUserRole(profile?.rol ?? null)
      } else {
        setUser(null)
        setUserRole(null)
      }
      // No tocar loading aquí para que el header no desaparezca
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error("Error durante signOut:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, userRole, loading, signOut, isConfigured: true }}
    >
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

export { supabase }
