"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Save } from "lucide-react"

interface UserProfile {
  id: string
  nombre: string
  email: string
  rol: string
  creado_en: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
  })
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user && !loading) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

      if (error) throw error

      setProfile(data)
      setFormData({
        nombre: data.nombre,
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !supabase) return

    setSaving(true)

    try {
      const { error } = await supabase.from("usuarios").update({ nombre: formData.nombre }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada exitosamente",
      })

      fetchProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRoleName = (rol: string) => {
    switch (rol) {
      case "admin":
        return "Administrador"
      case "distribuidor":
        return "Distribuidor"
      case "cliente":
        return "Cliente"
      default:
        return rol
    }
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información del perfil */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Información de la cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{profile.nombre}</p>
                    <p className="text-sm text-gray-500">{getRoleName(profile.rol)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{profile.email}</p>
                    <p className="text-sm text-gray-500">Email de contacto</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-500">Miembro desde {formatDate(profile.creado_en)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de edición */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Editar perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled className="bg-gray-50" />
                    <p className="text-sm text-gray-500 mt-1">
                      El email no se puede cambiar directamente. Contacta al administrador si necesitas cambiarlo.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        "Guardando..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
