"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({})
  const { toast } = useToast()
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Si no hay access_token en la URL, bloquea el formulario
    const token = params.get("access_token")
    if (!token) {
      setErrors({ general: "El enlace es inválido o ha expirado." })
    }
  }, [params])

  const validate = () => {
    const errs: typeof errors = {}
    if (!password) errs.password = "La contraseña es requerida"
    else if (password.length < 6) errs.password = "Mínimo 6 caracteres"
    if (password !== confirm) errs.confirm = "Las contraseñas no coinciden"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrors({ general: error.message })
    } else {
      toast({
        title: "Contraseña actualizada",
        description: "Ahora puedes iniciar sesión con tu nueva contraseña.",
      })
      router.push("/auth/login")
    }
    setLoading(false)
  }

  if (errors.general) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        {errors.general}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor="confirm">Repite la contraseña</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

