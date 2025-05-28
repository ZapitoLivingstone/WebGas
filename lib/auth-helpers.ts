import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  nombre: string
  email: string
  rol: "cliente" | "admin" | "distribuidor"
  creado_en: string
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("usuarios").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signUpWithEmail(
  email: string,
  password: string,
  userData: {
    nombre: string
    rol: "cliente" | "admin" | "distribuidor"
  },
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) return { data, error }

  if (data.user) {
    // Crear perfil de usuario
    const { error: profileError } = await supabase.from("usuarios").insert({
      id: data.user.id,
      nombre: userData.nombre,
      email: email,
      password_hash: "", // Supabase maneja esto
      rol: userData.rol,
    })

    if (profileError) {
      return { data, error: profileError }
    }
  }

  return { data, error }
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email)
}
