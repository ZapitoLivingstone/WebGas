"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing")
}

// Create Supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

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
  isConfigured: false,
  refreshAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const isConfigured = !!supabase

  const getUserRole = async (userId: string) => {
    if (!supabase) return null

    try {
      const { data: userData, error } = await supabase.from("usuarios").select("rol").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user role:", error)
        return null
      }

      return userData?.rol || null
    } catch (error) {
      console.error("Error in getUserRole:", error)
      return null
    }
  }

  const refreshAuth = async () => {
    if (!supabase) return

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)

      if (currentUser) {
        const role = await getUserRole(currentUser.id)
        setUserRole(role)
        console.log("Auth refreshed - User:", currentUser.email, "Role:", role)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      console.error("Error refreshing auth:", error)
      setUser(null)
      setUserRole(null)
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      setInitialized(true)
      return
    }

    const initializeAuth = async () => {
      try {
        // Obtener usuario actual
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        console.log("Initializing auth - User:", currentUser?.email)

        setUser(currentUser)

        if (currentUser) {
          const role = await getUserRole(currentUser.id)
          setUserRole(role)
          console.log("Initial auth - User:", currentUser.email, "Role:", role)
        } else {
          setUserRole(null)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setUser(null)
        setUserRole(null)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_OUT") {
        setUser(null)
        setUserRole(null)
        return
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const currentUser = session?.user || null
        setUser(currentUser)

        if (currentUser) {
          const role = await getUserRole(currentUser.id)
          setUserRole(role)
          console.log("Auth event - User:", currentUser.email, "Role:", role)
        } else {
          setUserRole(null)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!supabase) return

    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Limpiar estado inmediatamente
      setUser(null)
      setUserRole(null)

      // Recargar la página para limpiar completamente el estado
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // No renderizar hasta que la autenticación esté inicializada
  if (!initialized) {
    return <div>Cargando...</div>
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut, isConfigured, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export supabase client for use in other components
export { supabase }
