"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/providers/auth-provider"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cartItems, getCartTotal, loading } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    shipping_address: "",
    payment_method: "",
  })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!user && !loading) {
      router.push("/auth/login")
    }
    if (cartItems.length === 0 && !loading) {
      router.push("/cart")
    }
  }, [user, cartItems, loading, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          producto_id: item.product_id,
          cantidad: item.quantity,
          precio: item.product.precio,
          tipo: item.product.tipo,
        })),
        shipping_address: formData.shipping_address,
        payment_method: formData.payment_method,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Error al procesar el pedido")
      }

      const { order } = await response.json()

      toast({
        title: "Pedido creado exitosamente",
        description: `Tu pedido #${order.id} ha sido procesado`,
      })

      router.push(`/orders/${order.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el pedido",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
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

  if (!user || cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shipping_address">Dirección de Envío</Label>
                    <Textarea
                      id="shipping_address"
                      value={formData.shipping_address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, shipping_address: e.target.value }))}
                      required
                      placeholder="Ingresa tu dirección completa"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="payment_method">Selecciona método de pago</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_method: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="efectivo">Efectivo contra entrega</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={processing}>
                {processing ? "Procesando..." : "Confirmar Pedido"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.product.nombre}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.product.precio * item.quantity)}</p>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
