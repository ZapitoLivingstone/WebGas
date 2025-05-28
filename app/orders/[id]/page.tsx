"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/components/providers/auth-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/providers/auth-provider"
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react"

interface OrderDetail {
  id: number
  fecha: string
  total: number
  estado: string
  tipo_pago: string
  envio_direccion: string
  usuario: {
    nombre: string
    email: string
  }
  detalle_pedido: {
    cantidad: number
    precio_unitario: number
    tipo_producto: string
    producto: {
      nombre: string
      imagen_url: string
      precio: number
    }
  }[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user && !loading) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (params.id && user) {
      fetchOrder(Number.parseInt(params.id as string))
    }
  }, [params.id, user])

  const fetchOrder = async (orderId: number) => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id,
          fecha,
          total,
          estado,
          tipo_pago,
          envio_direccion,
          usuario:usuarios(nombre, email),
          detalle_pedido(
            cantidad,
            precio_unitario,
            tipo_producto,
            producto:productos(nombre, imagen_url, precio)
          )
        `)
        .eq("id", orderId)
        .eq("usuario_id", user.id)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completado":
        return "default"
      case "pendiente":
        return "secondary"
      case "cancelado":
        return "destructive"
      default:
        return "secondary"
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Pedido no encontrado</h2>
            <Button onClick={() => router.push("/orders")}>Volver a mis pedidos</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del pedido */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Pedido #{order.id}</CardTitle>
                    <p className="text-gray-600">{formatDate(order.fecha)}</p>
                  </div>
                  <Badge variant={getStatusColor(order.estado)} className="text-sm">
                    {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Productos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.detalle_pedido.map((detail, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Image
                        src={detail.producto.imagen_url || "/placeholder.svg"}
                        alt={detail.producto.nombre}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{detail.producto.nombre}</h4>
                        <p className="text-gray-600">Cantidad: {detail.cantidad}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {detail.tipo_producto}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(detail.precio_unitario)}</p>
                        <p className="text-sm text-gray-600">
                          Total: {formatPrice(detail.precio_unitario * detail.cantidad)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen y detalles */}
          <div className="space-y-6">
            {/* Resumen del pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Información de pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Información de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="capitalize">{order.tipo_pago}</p>
              </CardContent>
            </Card>

            {/* Dirección de envío */}
            {order.envio_direccion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{order.envio_direccion}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
