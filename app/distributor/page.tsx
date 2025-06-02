"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Bell, Package, XCircle, Truck } from "lucide-react"

interface Notification {
  id: number
  pedido_id: number
  producto_id: number
  estado: string
  fecha_envio: string
  pedido: {
    fecha: string
    envio_direccion: string
    usuario: {
      nombre: string
      email: string
    }
  }
  producto: {
    nombre: string
    descripcion: string
    precio: number
    imagen_url: string
  }
}

export default function DistributorPage() {
  const { user, userRole, loading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("pendientes")
  const [processingId, setProcessingId] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && (!user || userRole !== "distribuidor")) {
      router.push("/")
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    if (user && userRole === "distribuidor") {
      fetchNotifications()
    }
  }, [user, userRole, activeTab])

  const fetchNotifications = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from("notificaciones_distribuidor")
        .select(`
          id,
          pedido_id,
          producto_id,
          estado,
          fecha_envio,
          pedido:pedidos(
            fecha,
            envio_direccion,
            usuario:usuarios(nombre, email)
          ),
          producto:productos(
            nombre,
            descripcion,
            precio,
            imagen_url
          )
        `)
        .eq("distribuidor_id", user?.id)
        .eq("estado", activeTab === "pendientes" ? "pendiente" : activeTab === "enviados" ? "enviado" : "cancelado")
        .order("fecha_envio", { ascending: false })

      if (error) throw error
      setNotifications(
        (data || []).map((n: any) => ({
          ...n,
          pedido: Array.isArray(n.pedido) ? {
            ...n.pedido[0],
            usuario: Array.isArray(n.pedido[0]?.usuario) ? n.pedido[0].usuario[0] : n.pedido[0]?.usuario
          } : n.pedido,
          producto: Array.isArray(n.producto) ? n.producto[0] : n.producto
        }))
      )
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const updateNotificationStatus = async (id: number, status: string) => {
    if (!supabase) return

    setProcessingId(id)

    try {
      const { error } = await supabase.from("notificaciones_distribuidor").update({ estado: status }).eq("id", id)

      if (error) throw error

      toast({
        title: "Estado actualizado",
        description: `La notificación ha sido marcada como ${status}`,
      })

      fetchNotifications()
    } catch (error) {
      console.error("Error updating notification:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
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

  if (!user || userRole !== "distribuidor") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Distribuidor</h1>
        </div>

        <Tabs defaultValue="pendientes" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="pendientes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="enviado" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Enviados
            </TabsTrigger>
            <TabsTrigger value="cancelado" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Cancelados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendientes" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600">No hay notificaciones pendientes</h3>
                  <p className="text-gray-500 mt-2">Cuando recibas nuevos pedidos, aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{notification.pedido_id}</CardTitle>
                        <p className="text-gray-600">{formatDate(notification.fecha_envio)}</p>
                      </div>
                      <Badge>Pendiente</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Producto</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{notification.producto.nombre}</p>
                            <p className="text-sm text-gray-600">{formatPrice(notification.producto.precio)}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold">Cliente</h3>
                        <p className="mt-1">
                          {notification.pedido.usuario.nombre} ({notification.pedido.usuario.email})
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Dirección de envío</h3>
                        <p className="mt-1 whitespace-pre-line">{notification.pedido.envio_direccion}</p>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => updateNotificationStatus(notification.id, "cancelado")}
                          disabled={processingId === notification.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => updateNotificationStatus(notification.id, "enviado")}
                          disabled={processingId === notification.id}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Marcar como Enviado
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="enviado" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Truck className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600">No hay envíos registrados</h3>
                  <p className="text-gray-500 mt-2">Los pedidos que marques como enviados aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{notification.pedido_id}</CardTitle>
                        <p className="text-gray-600">{formatDate(notification.fecha_envio)}</p>
                      </div>
                      <Badge variant="default">Enviado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Producto</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{notification.producto.nombre}</p>
                            <p className="text-sm text-gray-600">{formatPrice(notification.producto.precio)}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold">Cliente</h3>
                        <p className="mt-1">
                          {notification.pedido.usuario.nombre} ({notification.pedido.usuario.email})
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Dirección de envío</h3>
                        <p className="mt-1 whitespace-pre-line">{notification.pedido.envio_direccion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelado" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600">No hay pedidos cancelados</h3>
                  <p className="text-gray-500 mt-2">Los pedidos que canceles aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{notification.pedido_id}</CardTitle>
                        <p className="text-gray-600">{formatDate(notification.fecha_envio)}</p>
                      </div>
                      <Badge variant="destructive">Cancelado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Producto</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{notification.producto.nombre}</p>
                            <p className="text-sm text-gray-600">{formatPrice(notification.producto.precio)}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold">Cliente</h3>
                        <p className="mt-1">
                          {notification.pedido.usuario.nombre} ({notification.pedido.usuario.email})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
