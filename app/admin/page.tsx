"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/components/providers/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/providers/auth-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react"

export default function AdminPage() {
  const { user, userRole, loading } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/")
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchStats()
      fetchRecentOrders()
    }
  }, [user, userRole])

  const fetchStats = async () => {
    try {
      // Obtener estadísticas
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        supabase.from("productos").select("id", { count: "exact" }),
        supabase.from("usuarios").select("id", { count: "exact" }),
        supabase.from("pedidos").select("id, total", { count: "exact" }),
      ])

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      setStats({
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const { data } = await supabase
        .from("pedidos")
        .select(`
          id,
          fecha,
          total,
          estado,
          usuario:usuarios(nombre, email)
        `)
        .order("fecha", { ascending: false })
        .limit(10)

      setRecentOrders(data || [])
    } catch (error) {
      console.error("Error fetching recent orders:", error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-CL")
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

  if (!user || userRole !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Button onClick={() => router.push("/pos")}>Ir al Punto de Venta</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Pedidos Recientes</TabsTrigger>
            <TabsTrigger value="products">Gestión de Productos</TabsTrigger>
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">Pedido #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {order.usuario?.nombre} - {order.usuario?.email}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(order.fecha)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                        <Badge variant={order.estado === "completado" ? "default" : "secondary"}>{order.estado}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => router.push("/admin/products/new")}>Agregar Nuevo Producto</Button>
                  <Button variant="outline" onClick={() => router.push("/admin/products")}>
                    Ver Todos los Productos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => router.push("/admin/users")}>Ver Todos los Usuarios</Button>
                  <Button variant="outline" onClick={() => router.push("/admin/distributors")}>
                    Gestionar Distribuidores
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
