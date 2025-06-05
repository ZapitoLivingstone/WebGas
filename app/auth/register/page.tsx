"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface RegisterErrors {
  nombre?: string
  email?: string
  telefono?: string
  direccion?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validate = () => {
    const newErrors: RegisterErrors = {}
    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!email.trim()) newErrors.email = "El correo es obligatorio"
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) newErrors.email = "Correo no válido"
    if (!telefono.trim()) newErrors.telefono = "El teléfono es obligatorio"
    else if (!/^(\+?\d{1,3})? ?\d{8,15}$/.test(telefono.replace(/\s/g, "")))
      newErrors.telefono = "Teléfono no válido"
    if (!direccion.trim()) newErrors.direccion = "La dirección es obligatoria"
    if (!password) newErrors.password = "La contraseña es obligatoria"
    else if (password.length < 6) newErrors.password = "Mínimo 6 caracteres"
    if (!confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña"
    else if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const foundErrors = validate()
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length > 0) return

    setLoading(true)
    try {
      // 1) Registra en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError

      // 2) Inserta en tu tabla usuarios
      if (authData.user) {
        const { data: profileData, error: profileError, status, statusText } = await supabase
          .from("usuarios")
          .insert({
            id: authData.user.id,
            nombre,
            email,
            telefono,
            direccion,
            rol: "cliente",
          })
          .single()

        if (profileError) {
          throw new Error(
            `Insert usuario falló: ${status} ${statusText} — ${profileError.message}`
          )
        }
      }

      toast({ title: "¡Registro exitoso!", description: "Revisa tu email para confirmar tu cuenta." })
      router.push("/auth/login")
    } catch (err: any) {
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Input
                placeholder="Nombre completo"
                value={nombre}
                onChange={e => { setNombre(e.target.value); setErrors(prev => ({ ...prev, nombre: undefined })) }}
                autoComplete="name"
              />
              {errors.nombre && (
                <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
              )}
            </div>
            <div>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <Input
                type="tel"
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={e => { setTelefono(e.target.value); setErrors(prev => ({ ...prev, telefono: undefined })) }}
                autoComplete="tel"
              />
              {errors.telefono && (
                <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Dirección completa"
                value={direccion}
                onChange={e => { setDireccion(e.target.value); setErrors(prev => ({ ...prev, direccion: undefined })) }}
                autoComplete="street-address"
              />
              {errors.direccion && (
                <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })) }}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
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
