"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VentaCard, VentaUnified } from "@/components/ventas/VentaCard"

// ——— Helpers seguros ———
const ensureArray = <T,>(val: T | T[] | null | undefined): T[] => {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

const getNombreUsuario = (u: unknown): string => {
  if (!u) return "Desconocido"
  if (Array.isArray(u)) {
    const first = u[0]
    if (first && typeof first === "object" && first !== null && "nombre" in first) {
      return first.nombre ?? "Desconocido"
    }
    return "Desconocido"
  }
  if (typeof u === "object" && u !== null && "nombre" in (u as any)) {
    return (u as any).nombre ?? "Desconocido"
  }
  return "Desconocido"
}

const getNombreProducto = (p: unknown): string => {
  if (!p) return "¿?"
  if (Array.isArray(p)) {
    const first = p[0]
    if (first && typeof first === "object" && first !== null && "nombre" in first) {
      return first.nombre ?? "¿?"
    }
    return "¿?"
  }
  if (typeof p === "object" && p !== null && "nombre" in (p as any)) {
    return (p as any).nombre ?? "¿?"
  }
  return "¿?"
}

export default function VentasFiltradasPage() {
  const [ventas, setVentas] = useState<VentaUnified[]>([])
  const [filteredVentas, setFilteredVentas] = useState<VentaUnified[]>([])
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [tipoVenta, setTipoVenta] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVentas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVentas = async () => {
    setLoading(true)
    setError(null)
    try {
      // ——— Ventas POS ———
      // Si conoces los nombres exactos de las FKs, usa:
      // usuario:usuarios!ventas_pos_admin_id_fkey(nombre)
      const { data: pos, error: posErr } = await supabase
        .from("ventas_pos")
        .select(`
          id, fecha, metodo_pago, total_bruto, descuento_total, total_final,
          admin_id,
          usuario:admin_id(nombre),
          detalle_ventas_pos (
            id, cantidad, precio_unitario, subtotal, producto_id,
            producto:producto_id(nombre)
          )
        `)

      if (posErr) {
        console.warn("[ventas_pos] error:", posErr.message)
      }

      // ——— Ventas WEB ———
      // Análogo: usuario:usuarios!pedidos_usuario_id_fkey(nombre)
      const { data: web, error: webErr } = await supabase
        .from("pedidos")
        .select(`
          id, fecha, tipo_pago, total,
          usuario_id,
          usuario:usuario_id(nombre),
          detalle_pedido (
            id, cantidad, precio_unitario, pedido_id, producto_id,
            producto:producto_id(nombre)
          )
        `)

      if (webErr) {
        console.warn("[pedidos] error:", webErr.message)
      }

      // ——— Map POS seguro ———
      const posVentas: VentaUnified[] = ensureArray(pos as any).map((v: any) => {
        const detalles = ensureArray(v?.detalle_ventas_pos).map((d: any) => ({
          id: d?.id,
          nombre: getNombreProducto(d?.producto),
          cantidad: d?.cantidad ?? 0,
          precio_unitario: d?.precio_unitario ?? 0,
          subtotal: d?.subtotal ?? (d?.precio_unitario ?? 0) * (d?.cantidad ?? 0),
        }))

        return {
          id: v?.id,
          fecha: v?.fecha,
          metodo_pago: v?.metodo_pago,
          total_bruto: v?.total_bruto ?? 0,
          descuento_total: v?.descuento_total ?? 0,
          total_final: v?.total_final ?? 0,
          origen: "pos",
          usuario: getNombreUsuario(v?.usuario),
          productos: detalles,
        }
      })

      // ——— Map WEB seguro ———
      const webVentas: VentaUnified[] = ensureArray(web as any).map((v: any) => {
        const detalles = ensureArray(v?.detalle_pedido).map((d: any) => ({
          id: d?.id,
          nombre: getNombreProducto(d?.producto),
          cantidad: d?.cantidad ?? 0,
          precio_unitario: d?.precio_unitario ?? 0,
          subtotal: (d?.precio_unitario ?? 0) * (d?.cantidad ?? 0),
        }))

        return {
          id: v?.id,
          fecha: v?.fecha,
          metodo_pago: v?.tipo_pago,
          total_bruto: v?.total ?? 0,
          descuento_total: 0,
          total_final: v?.total ?? 0,
          origen: "web",
          usuario: getNombreUsuario(v?.usuario),
          productos: detalles,
        }
      })

      const all = [...posVentas, ...webVentas].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      setVentas(all)
      setFilteredVentas(all)
    } catch (e: any) {
      console.error("[fetchVentas] error:", e)
      setError("Ocurrió un error al obtener las ventas.")
      setVentas([])
      setFilteredVentas([])
    } finally {
      setLoading(false)
    }
  }

  const filterVentas = () => {
    let filtradas = [...ventas]

    if (fechaInicio && fechaFin) {
      const start = new Date(fechaInicio)
      const end = new Date(fechaFin)
      // Normalizar fin del día para incluir resultados de ese día completo
      end.setHours(23, 59, 59, 999)

      filtradas = filtradas.filter((v) => {
        const fecha = new Date(v.fecha)
        return fecha >= start && fecha <= end
      })
    }

    if (tipoVenta) {
      filtradas = filtradas.filter((v) => v.origen === tipoVenta)
    }

    setFilteredVentas(filtradas)
  }

  const limpiarFiltros = () => {
    setFechaInicio("")
    setFechaFin("")
    setTipoVenta("")
    setFilteredVentas(ventas)
  }

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Historial de Ventas</h1>

      <Card className="mb-8 px-6 py-6 shadow-md border border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-sm block mb-1">Desde</label>
            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block mb-1">Hasta</label>
            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block mb-1">Origen</label>
            <Select value={tipoVenta} onValueChange={setTipoVenta}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="web">Internet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={filterVentas}>Filtrar</Button>
          <Button onClick={limpiarFiltros} variant="outline" className="text-muted-foreground">
            Limpiar filtros
          </Button>
          <Button variant="ghost" onClick={fetchVentas}>
            Recargar
          </Button>
        </div>
        {loading && <p className="mt-4 text-sm text-muted-foreground">Cargando ventas…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </Card>

      <div className="flex flex-col gap-y-6">
        {filteredVentas.map((venta) => (
          <VentaCard key={`${venta.origen}-${venta.id}`} venta={venta} formatPrice={formatPrice} />
        ))}
        {!loading && filteredVentas.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No hay ventas en este rango o tipo.
          </p>
        )}
      </div>
    </div>
  )
}
