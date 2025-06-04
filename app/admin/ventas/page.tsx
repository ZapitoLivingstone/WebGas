"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface VentaUnified {
  id: number
  fecha: string
  metodo_pago: string
  total_bruto: number
  descuento_total: number
  total_final: number
  origen: "pos" | "web"
}

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
    const [resPOS, resWEB] = await Promise.all([
      supabase.from("ventas_pos").select("id, fecha, metodo_pago, total_bruto, descuento_total, total_final"),
      supabase.from("pedidos").select("id, fecha, tipo_pago, total")
    ])

    const posVentas: VentaUnified[] = (resPOS.data || []).map((v) => ({
      id: v.id,
      fecha: v.fecha,
      metodo_pago: v.metodo_pago,
      total_bruto: v.total_bruto,
      descuento_total: v.descuento_total,
      total_final: v.total_final,
      origen: "pos"
    }))

    const webVentas: VentaUnified[] = (resWEB.data || []).map((v) => ({
      id: v.id,
      fecha: v.fecha,
      metodo_pago: v.tipo_pago,
      total_bruto: v.total,
      descuento_total: 0,
      total_final: v.total,
      origen: "web"
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

  const formatPrice = (n: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Todas las Ventas</h1>

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="text-sm block">Desde</label>
          <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </div>
        <div>
          <label className="text-sm block">Hasta</label>
          <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
        <div>
          <label className="text-sm block">Origen</label>
          <Select value={tipoVenta} onValueChange={setTipoVenta}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pos">POS</SelectItem>
              <SelectItem value="web">Internet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={filterVentas}>Filtrar</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredVentas.map((venta) => (
          <Card key={`${venta.origen}-${venta.id}`}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Venta #{venta.id} ({venta.origen.toUpperCase()})</CardTitle>
              <p className="text-sm text-muted-foreground">{format(new Date(venta.fecha), "dd-MM-yyyy HH:mm")}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><strong>Pago:</strong> {venta.metodo_pago}</div>
              <div><strong>Bruto:</strong> {formatPrice(Number(venta.total_bruto))}</div>
              <div><strong>Descuento:</strong> {formatPrice(Number(venta.descuento_total))}</div>
              <div><strong>Total:</strong> {formatPrice(Number(venta.total_final))}</div>
            </CardContent>
          </Card>
        ))}
        {filteredVentas.length === 0 && <p className="text-sm text-muted-foreground">No hay ventas en este rango o tipo.</p>}
      </div>
    </div>
  )
}
