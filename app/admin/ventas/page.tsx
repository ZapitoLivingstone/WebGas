"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VentaCard, VentaUnified } from "@/components/ventas/VentaCard"
import { format } from "date-fns"

export default function VentasFiltradasPage() {
  const [ventas, setVentas] = useState<VentaUnified[]>([])
  const [filteredVentas, setFilteredVentas] = useState<VentaUnified[]>([])
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [tipoVenta, setTipoVenta] = useState("")

  useEffect(() => {
    fetchVentas()
  }, [])

  const fetchVentas = async () => {
    // Ventas POS
    const { data: pos } = await supabase
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

    // Ventas WEB
    const { data: web } = await supabase
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

    // Define types for Supabase response
    type Producto = { nombre: string }
    type DetalleVentaPos = {
      id: number
      cantidad: number
      precio_unitario: number
      subtotal: number
      producto: Producto | Producto[]
    }
    type Usuario = { nombre: string }
    type VentaPos = {
      id: number
      fecha: string
      metodo_pago: string
      total_bruto: number
      descuento_total: number
      total_final: number
      admin_id: number
      usuario: Usuario[] | Usuario
      detalle_ventas_pos: DetalleVentaPos[] | DetalleVentaPos
    }

    // Unificación y protección de productos
    const posVentas: VentaUnified[] = ((pos as VentaPos[]) || []).map((v) => ({
      id: v.id,
      fecha: v.fecha,
      metodo_pago: v.metodo_pago,
      total_bruto: v.total_bruto,
      descuento_total: v.descuento_total,
      total_final: v.total_final,
      origen: "pos",
      usuario: Array.isArray(v.usuario) && v.usuario.length > 0 ? v.usuario[0].nombre : (typeof v.usuario === "object" && "nombre" in v.usuario ? v.usuario.nombre : "Desconocido"),
      productos: Array.isArray(v.detalle_ventas_pos)
        ? v.detalle_ventas_pos.map((d) => ({
            id: d.id,
            nombre: Array.isArray(d.producto) ? (d.producto[0]?.nombre || "¿?") : (d.producto as Producto)?.nombre || "¿?",
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.subtotal,
          }))
        : [],
    }))

    // Define types for web response
    type DetallePedido = {
      id: number
      cantidad: number
      precio_unitario: number
      pedido_id: number
      producto_id: number
      producto: Producto | Producto[]
    }
    type Pedido = {
      id: number
      fecha: string
      tipo_pago: string
      total: number
      usuario_id: number
      usuario: Usuario[] | Usuario
      detalle_pedido: DetallePedido[] | DetallePedido
    }

    const webVentas: VentaUnified[] = ((web as Pedido[]) || []).map((v) => ({
      id: v.id,
      fecha: v.fecha,
      metodo_pago: v.tipo_pago,
      total_bruto: v.total,
      descuento_total: 0,
      total_final: v.total,
      origen: "web",
      usuario: Array.isArray(v.usuario) && v.usuario.length > 0 ? v.usuario[0].nombre : (typeof v.usuario === "object" && "nombre" in v.usuario ? v.usuario.nombre : "Desconocido"),
      productos: Array.isArray(v.detalle_pedido)
        ? v.detalle_pedido.map((d) => ({
            id: d.id,
            nombre: Array.isArray(d.producto) ? (d.producto[0]?.nombre || "¿?") : (typeof d.producto === "object" && "nombre" in d.producto ? d.producto.nombre : "¿?"),
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.precio_unitario * d.cantidad,
          }))
        : [],
    }))

    const all = [...posVentas, ...webVentas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    setVentas(all)
    setFilteredVentas(all)
  }

  const filterVentas = () => {
    let filtradas = [...ventas]
    if (fechaInicio && fechaFin) {
      const start = new Date(fechaInicio)
      const end = new Date(fechaFin)
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

  const formatPrice = (n: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n)

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
        </div>
      </Card>
      <div className="flex flex-col gap-y-6">
        {filteredVentas.map((venta) => (
          <VentaCard key={`${venta.origen}-${venta.id}`} venta={venta} formatPrice={formatPrice} />
        ))}
        {filteredVentas.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No hay ventas en este rango o tipo.</p>
        )}
      </div>
    </div>
  )
}
