"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"        // ✅ IMPORT UNIFICADO

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" })
    }
    if (password.length < 6) {
      return toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" })
    }

    setLoading(true)
    try {
      // 1) Registra en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError

      // 2) Inserta en tu tabla usuarios
      if (authData.user) {
  // insert + return data para capturar bien el error
        const { data: profileData, error: profileError, status, statusText } = await supabase
          .from("usuarios")
          .insert(
            {
              id: authData.user.id,
              nombre,
              email,
              telefono,
              direccion,
              rol: "cliente",
            }
          )
          .single()

        if (profileError) {
          // lanza un error con mensaje completo
          throw new Error(
            `Insert usuario falló: ${status} ${statusText} — ${profileError.message}`
          )
        }
      }


      toast({ title: "¡Registro exitoso!", description: "Revisa tu email para confirmar tu cuenta." })
      router.push("/auth/login")
    } catch (err: any) {
      console.error("Error during registration:", err)
      const message = err.message || JSON.stringify(err)
      toast({
        title: "Error en el registro",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>Únete a Gásfiter Pro como cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
            <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="tel" placeholder="+56 9 1234 5678" value={telefono} onChange={e => setTelefono(e.target.value)} required />
            <Input placeholder="Dirección completa" value={direccion} onChange={e => setDireccion(e.target.value)} required />
            <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
            <Input type="password" placeholder="Confirma tu contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
