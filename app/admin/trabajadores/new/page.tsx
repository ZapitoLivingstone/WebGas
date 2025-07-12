"use client"

import { useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import clsx from "clsx"

export default function CrearTrabajadorPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    direccion: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const refs = {
    nombre: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    confirmPassword: useRef<HTMLInputElement>(null),
  }

  if (!user || userRole !== "admin") {
    router.push("/")
    return null
  }

  // Validación pro
  const validate = async () => {
    const newErrors: { [key: string]: string } = {}
    if (!form.nombre.trim()) newErrors.nombre = "Ingrese el nombre."
    if (!form.email.trim()) {
      newErrors.email = "Ingrese un email."
    } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      newErrors.email = "Email no válido."
    }
    if (!form.password) newErrors.password = "Ingrese una contraseña."
    else if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres."
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirme la contraseña."
    else if (form.confirmPassword !== form.password) newErrors.confirmPassword = "No coinciden las contraseñas."
    return newErrors
  }

  // Autofocus en primer error
  const focusFirstError = (errObj: { [k: string]: string }) => {
    const order = ["nombre", "email", "password", "confirmPassword"]
    for (const key of order) {
      if (errObj[key] && refs[key as keyof typeof refs].current) {
        refs[key as keyof typeof refs].current?.focus()
        break
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }))
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setLoading(true)
    setErrors({})

    const validationErrors = await validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors)
      setLoading(false)
      return
    }

    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      })

      if (error) {
        if (error.message?.toLowerCase().includes("user already registered")) {
          setErrors({ email: "Este email ya está registrado." })
        } else {
          setErrors({ global: error.message || "Error al crear el usuario." })
        }
        setLoading(false)
        return
      }

      if (!data?.user?.id) {
        setErrors({ global: "No se pudo crear el usuario en Auth." })
        setLoading(false)
        return
      }

      // 2. Insertar en tu tabla usuarios (solo si Auth ok)
      const { error: errorDb } = await supabase.from("usuarios").insert([
        {
          id: data.user.id,
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim() || null,
          direccion: form.direccion.trim() || null,
          rol: "trabajador",
        },
      ])
      if (errorDb) {
        setErrors({ global: errorDb.message || "Error al guardar en la base." })
        setLoading(false)
        return
      }

      setSuccess("Trabajador creado correctamente. Debe confirmar el correo.")
      setForm({
        nombre: "",
        email: "",
        password: "",
        confirmPassword: "",
        telefono: "",
        direccion: "",
      })
    } catch (err: any) {
      setErrors({ global: err.message || "Ocurrió un error." })
    }
    setLoading(false)
  }

  // --- UI / UX ---
  return (
    <div className="max-w-xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Crear Nuevo Trabajador</h2>
      {success && (
        <div className="mb-6 text-green-600 bg-green-50 border border-green-200 rounded-xl text-center py-2 font-semibold animate-in fade-in duration-500">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-lg rounded-2xl px-8 py-8 border">
        <div>
          <label className="font-medium block mb-1">Nombre completo</label>
          <Input
            ref={refs.nombre}
            name="nombre"
            placeholder="Ej: Camila Torres"
            autoComplete="off"
            value={form.nombre}
            onChange={handleChange}
            className={clsx(errors.nombre && "border-red-500 focus:ring-red-400")}
            disabled={loading}
          />
          {errors.nombre && (
            <span className="text-xs text-red-500 mt-1 block animate-in fade-in">{errors.nombre}</span>
          )}
        </div>
        <div>
          <label className="font-medium block mb-1">Correo electrónico</label>
          <Input
            ref={refs.email}
            name="email"
            type="email"
            placeholder="trabajador@email.com"
            autoComplete="off"
            value={form.email}
            onChange={handleChange}
            className={clsx(errors.email && "border-red-500 focus:ring-red-400")}
            disabled={loading}
          />
          {errors.email && (
            <span className="text-xs text-red-500 mt-1 block animate-in fade-in">{errors.email}</span>
          )}
        </div>
        <div>
          <label className="font-medium block mb-1">Contraseña</label>
          <div className="relative">
            <Input
              ref={refs.password}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={clsx(errors.password && "border-red-500 focus:ring-red-400", "pr-12")}
              disabled={loading}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-500 mt-1 block animate-in fade-in">{errors.password}</span>
          )}
        </div>
        <div>
          <label className="font-medium block mb-1">Confirmar contraseña</label>
          <div className="relative">
            <Input
              ref={refs.confirmPassword}
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repita la contraseña"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={clsx(errors.confirmPassword && "border-red-500 focus:ring-red-400", "pr-12")}
              disabled={loading}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500 mt-1 block animate-in fade-in">{errors.confirmPassword}</span>
          )}
        </div>
        <div>
          <label className="font-medium block mb-1">Teléfono (opcional)</label>
          <Input
            name="telefono"
            placeholder="Ej: +56911112222"
            value={form.telefono}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="font-medium block mb-1">Dirección (opcional)</label>
          <Input
            name="direccion"
            placeholder="Ej: Calle 123, Ciudad"
            value={form.direccion}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        {errors.global && (
          <div className="text-red-600 text-sm mt-2 text-center animate-in fade-in">{errors.global}</div>
        )}
        <Button
          type="submit"
          className={clsx("w-full mt-3", loading && "opacity-70 pointer-events-none")}
          disabled={loading}
        >
          {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {loading ? "Creando trabajador..." : "Crear trabajador"}
        </Button>
      </form>
    </div>
  )
}
