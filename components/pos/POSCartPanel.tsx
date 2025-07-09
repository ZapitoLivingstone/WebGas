"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Tag } from "lucide-react"

interface Product {
  id: number
  nombre: string
  precio: number
}
interface CartItem {
  product: Product
  quantity: number
}
interface Props {
  cart: CartItem[]
  updateQuantity: (id: number, qty: number) => void
  showDescuentoInput: boolean
  setShowDescuentoInput: (b: boolean) => void
  descuentoGlobal: string
  setDescuentoGlobal: (val: string) => void
  getTotalFinal: () => number
  formatPrice: (n: number) => string
}
export function POSCartPanel({
  cart, updateQuantity, showDescuentoInput, setShowDescuentoInput,
  descuentoGlobal, setDescuentoGlobal, getTotalFinal, formatPrice
}: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Venta</CardTitle></CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Agrega productos</p>
        ) : (
          <div className="space-y-2 max-h-[38vh] overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                <div className="w-3/5">
                  <span className="font-bold">{item.product.nombre}</span>
                  <div className="text-gray-500">{formatPrice(item.product.precio)}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-bold px-2">{item.quantity}</span>
                  <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator className="my-2" />
            <Button onClick={() => setShowDescuentoInput(!showDescuentoInput)} variant="outline" size="sm" className="w-full">
              <Tag className="h-4 w-4 mr-2" /> Aplicar descuento global
            </Button>
            {showDescuentoInput && (
              <Input
                placeholder="Ej: 10% o 1000"
                value={descuentoGlobal}
                onChange={(e) => setDescuentoGlobal(e.target.value)}
                className="mt-1"
              />
            )}
            <div className="text-right pt-2 text-base font-extrabold">
              Total: <span className="text-[#C22320]">{formatPrice(getTotalFinal())}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
