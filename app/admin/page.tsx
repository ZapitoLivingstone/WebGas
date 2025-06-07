"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  type RecentOrder = {
    id: any
    fecha: any
    total: any
    estado: any
    usuario: { nombre: any; email: any }
  }
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
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

      setRecentOrders(
        (data || []).map((order: any) => ({
          ...order,
          usuario: Array.isArray(order.usuario) ? order.usuario[0] : order.usuario,
        }))
      )
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
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <main className="flex-1 w-full max-w-full px-2 sm:px-4 py-6 sm:py-8 mx-auto">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administración</h1>
          <Button
            className="w-full sm:w-auto"
            onClick={() => router.push("/admin/pos")}
          >
            Ir al Punto de Venta
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Productos</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Usuarios</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Pedidos</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Aquí puedes añadir tus tablas/listados con overflow-x-auto para que sean responsivos en móvil */}
        {/* Ejemplo para el futuro: */}
        {/* <div className="overflow-x-auto">
              ...tu tabla aquí...
            </div> */}
      </main>
      <Footer />
    </div>
  )
}
