"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, CreditCard, DollarSign, Banknote, Globe, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { JSX } from "react/jsx-runtime"

const metodoPagoIcons: Record<string, JSX.Element> = {
  efectivo: <DollarSign className="inline-block w-4 h-4 mr-1" />,
  tarjeta_debito: <CreditCard className="inline-block w-4 h-4 mr-1" />,
  tarjeta_credito: <CreditCard className="inline-block w-4 h-4 mr-1" />,
  transferencia: <Banknote className="inline-block w-4 h-4 mr-1" />,
  webpay: <Globe className="inline-block w-4 h-4 mr-1" />,
}

export interface ProductoVendido {
  id: number
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface VentaUnified {
  id: number
  fecha: string
  metodo_pago: string
  total_bruto: number
  descuento_total: number
  total_final: number
  origen: "pos" | "web"
  usuario: string
  productos: ProductoVendido[]
}

export function VentaCard({
  venta,
  formatPrice,
}: {
  venta: VentaUnified
  formatPrice: (n: number) => string
}) {
  const [expand, setExpand] = useState(false)
  return (
    <Card className="rounded-2xl shadow-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all">
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl py-4 px-6 border-b">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-base md:text-lg font-semibold">Venta #{venta.id}</span>
          <Badge
            variant={venta.origen === "pos" ? "default" : "secondary"}
            className={venta.origen === "pos" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}
          >
            {venta.origen === "pos" ? "POS" : "Internet"}
          </Badge>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border ml-2">
            <span className="font-medium mr-1">{venta.origen === "pos" ? "Cajero:" : "Cliente:"}</span> {venta.usuario}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <span className="text-xs text-gray-500 font-mono">
            {format(new Date(venta.fecha), "dd-MM-yyyy HH:mm")}
          </span>
          <Button size="icon" variant="ghost" className="ml-2" tabIndex={-1}>
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 py-6 px-6">
        <div className="flex flex-wrap md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 min-w-[120px]">
            {metodoPagoIcons[venta.metodo_pago] || <ShoppingCart className="w-4 h-4 mr-1" />}
            <span className="font-medium text-gray-700 capitalize">{venta.metodo_pago.replace("_", " ")}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Bruto</span>
            <span className="font-medium">{formatPrice(Number(venta.total_bruto))}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Descuento</span>
            <span className="font-medium text-red-600">{formatPrice(Number(venta.descuento_total))}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Total</span>
            <span className="text-2xl font-bold text-green-700">{formatPrice(Number(venta.total_final))}</span>
          </div>
          <Button variant="ghost" className="ml-auto text-blue-700 flex items-center" onClick={() => setExpand(!expand)}>
            {expand ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            <span className="ml-1">{expand ? "Ocultar Detalle" : "Ver Detalle"}</span>
          </Button>
        </div>
        {expand && (
          <div className="border-t pt-4 mt-2">
            <div className="font-semibold mb-2 text-gray-800 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" /> Productos vendidos:
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="text-left py-1 pr-4">Producto</th>
                    <th className="text-left py-1 pr-4">Cantidad</th>
                    <th className="text-left py-1 pr-4">P. Unitario</th>
                    <th className="text-left py-1 pr-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(venta.productos) && venta.productos.length > 0 ? (
                    venta.productos.map((prod) => (
                      <tr key={prod.id} className="border-b last:border-0">
                        <td className="py-1 pr-4">{prod.nombre}</td>
                        <td className="py-1 pr-4">{prod.cantidad}</td>
                        <td className="py-1 pr-4">{formatPrice(Number(prod.precio_unitario))}</td>
                        <td className="py-1 pr-4">{formatPrice(Number(prod.subtotal))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-gray-400 text-center py-2">
                        Sin productos vendidos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
