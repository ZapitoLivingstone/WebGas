"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase" 
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Package, Eye } from "lucide-react"

interface Order {
  id: number
  fecha: string
  total: number
  estado: string
  tipo_pago: string
  detalle_pedido: {
    cantidad: number
    precio_unitario: number
    producto: {
      nombre: string
      imagen_url: string
    }
  }[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user && !loading) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
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
          detalle_pedido(
            cantidad,
            precio_unitario,
            producto:productos(nombre, imagen_url)
          )
        `)
        .eq("usuario_id", user.id)
        .order("fecha", { ascending: false })

      if (error) throw error
      setOrders(
        (data || []).map((order: any) => ({
          ...order,
          detalle_pedido: (order.detalle_pedido || []).map((detalle: any) => ({
            ...detalle,
            producto: Array.isArray(detalle.producto) ? detalle.producto[0] : detalle.producto,
            cantidad: Number(detalle.cantidad),
            precio_unitario: Number(detalle.precio_unitario),
          })),
        }))
      )
    } catch (error) {
      console.error("Error fetching orders:", error)
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No tienes pedidos aún</h2>
            <p className="text-gray-500 mb-6">Cuando realices tu primera compra, aparecerá aquí</p>
            <Button onClick={() => router.push("/products")}>Explorar Productos</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                      <p className="text-gray-600">{formatDate(order.fecha)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(order.estado)} className="mb-2">
                        {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                      </Badge>
                      <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Método de pago:</span> {order.tipo_pago}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Productos ({order.detalle_pedido.length})</h4>
                      <div className="space-y-2">
                        {order.detalle_pedido.slice(0, 3).map((detail, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span>
                              {detail.cantidad}x {detail.producto.nombre} - {formatPrice(detail.precio_unitario)}
                            </span>
                          </div>
                        ))}
                        {order.detalle_pedido.length > 3 && (
                          <p className="text-sm text-gray-500 ml-5">+{order.detalle_pedido.length - 3} productos más</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
