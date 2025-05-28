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
import { supabase } from "@/components/providers/auth-provider"

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cartItems, getCartTotal, loading, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    shipping_address: "",
    payment_method: "",
  })
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<{
    shipping_address?: string
    payment_method?: string
    general?: string
  }>({})

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

  const validateForm = () => {
    const newErrors: {
      shipping_address?: string
      payment_method?: string
    } = {}

    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = "La dirección de envío es requerida"
    }

    if (!formData.payment_method) {
      newErrors.payment_method = "Selecciona un método de pago"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createOrder = async () => {
    if (!user || !supabase) throw new Error("Usuario no autenticado")

    const items = cartItems.map((item) => ({
      producto_id: item.product_id,
      cantidad: item.quantity,
      precio: item.product.precio,
      tipo: item.product.tipo,
    }))

    const total = getCartTotal()

    // Crear pedido
    const { data: order, error: orderError } = await supabase
      .from("pedidos")
      .insert({
        usuario_id: user.id,
        tipo_pago: formData.payment_method,
        envio_direccion: formData.shipping_address,
        total: total,
        estado: "pendiente",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Crear detalles del pedido
    const orderDetails = items.map((item) => ({
      pedido_id: order.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      tipo_producto: item.tipo,
    }))

    const { error: detailsError } = await supabase.from("detalle_pedido").insert(orderDetails)

    if (detailsError) throw detailsError

    // Crear notificaciones para productos dropshipping
    const dropshippingItems = items.filter((item) => item.tipo === "dropshipping")

    if (dropshippingItems.length > 0) {
      const { data: distributors } = await supabase.from("usuarios").select("id").eq("rol", "distribuidor").limit(1)

      if (distributors && distributors.length > 0) {
        const notifications = dropshippingItems.map((item) => ({
          pedido_id: order.id,
          producto_id: item.producto_id,
          distribuidor_id: distributors[0].id,
          estado: "pendiente",
        }))

        await supabase.from("notificaciones_distribuidor").insert(notifications)
      }
    }

    // Actualizar stock para productos propios
    for (const item of items.filter((i) => i.tipo === "propio")) {
      // Obtener el stock actual
      const { data: producto, error: productoError } = await supabase
        .from("productos")
        .select("stock")
        .eq("id", item.producto_id)
        .single()

      if (productoError) throw productoError

      const nuevoStock = (producto?.stock ?? 0) - item.cantidad

      await supabase
        .from("productos")
        .update({
          stock: nuevoStock,
        })
        .eq("id", item.producto_id)
    }

    return order
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) return

    setProcessing(true)

    try {
      const order = await createOrder()

      // Limpiar carrito
      await clearCart()

      toast({
        title: "Pedido creado exitosamente",
        description: `Tu pedido #${order.id} ha sido procesado`,
      })

      router.push(`/orders/${order.id}`)
    } catch (error: any) {
      console.error("Error creating order:", error)
      setErrors({ general: "No se pudo procesar el pedido. Intenta nuevamente." })
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
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

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
                      placeholder="Ingresa tu dirección completa"
                      rows={3}
                      className={errors.shipping_address ? "border-red-500" : ""}
                    />
                    {errors.shipping_address && <p className="text-red-500 text-sm mt-1">{errors.shipping_address}</p>}
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
                    >
                      <SelectTrigger className={errors.payment_method ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecciona método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="efectivo">Efectivo contra entrega</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
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
