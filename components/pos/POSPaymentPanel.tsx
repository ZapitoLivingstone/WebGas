"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select"

interface Props {
  paymentMethod: string
  setPaymentMethod: (val: string) => void
  efectivoIngresado: string
  setEfectivoIngresado: (val: string) => void
  vuelto: number
  formatPrice: (n: number) => string
}
export function POSPaymentPanel({ paymentMethod, setPaymentMethod, efectivoIngresado, setEfectivoIngresado, vuelto, formatPrice }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Método de pago</CardTitle></CardHeader>
      <CardContent>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="tarjeta_debito">Tarjeta Débito</SelectItem>
            <SelectItem value="tarjeta_credito">Tarjeta Crédito</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
          </SelectContent>
        </Select>
        {paymentMethod === "efectivo" && (
          <div className="mt-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Efectivo recibido"
              value={efectivoIngresado}
              onChange={(e) => setEfectivoIngresado(e.target.value)}
            />
            <p className="text-xs mt-2">Vuelto: <strong>{formatPrice(vuelto >= 0 ? vuelto : 0)}</strong></p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
