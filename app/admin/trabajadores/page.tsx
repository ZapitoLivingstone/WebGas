"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, User, Mail, Phone, Home } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

export default function TrabajadoresPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!user || userRole !== "admin") {
      router.push("/")
      return
    }
    fetchTrabajadores()
  }, [user, userRole])

  const fetchTrabajadores = async () => {
    const { data, error } = await supabase
      .rpc("admin_listar_trabajadores")
      .select("id, nombre, email, telefono, direccion, creado_en")
      .order("creado_en", { ascending: false })
    setTrabajadores(data || [])
  }

  const trabajadoresFiltrados = trabajadores.filter(
    (t) =>
      t.nombre.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.telefono || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" /> Trabajadores
        </h2>
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => router.push("/admin/trabajadores/new")}
        >
          <Plus className="w-4 h-4" /> Crear trabajador
        </Button>
      </div>

      <div className="mb-5 max-w-xs">
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-gray-600 text-sm border-b">
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Dirección</th>
              <th className="px-4 py-3 text-left">Creado</th>
            </tr>
          </thead>
          <tbody>
            {trabajadoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  No se encontraron trabajadores.
                </td>
              </tr>
            ) : (
              trabajadoresFiltrados.map((t) => (
                <tr key={t.id} className="border-b hover:bg-blue-50/40 transition">
                  <td className="px-4 py-3">{t.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" /> {t.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {t.telefono ? t.telefono : <span className="text-gray-300">Sin teléfono</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      {t.direccion ? t.direccion : <span className="text-gray-300">Sin dirección</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {t.creado_en ? new Date(t.creado_en).toLocaleDateString("es-CL") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}
