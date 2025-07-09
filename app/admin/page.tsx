"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Package, Users, ShoppingCart, TrendingUp, ArrowRight } from "lucide-react"

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
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user || userRole !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <main className="flex-1 w-full max-w-full px-2 sm:px-4 py-8 mx-auto">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#C22320]">Panel de Administración</h1>
          <Button
            className="w-full sm:w-auto bg-[#C22320] hover:bg-[#a31916] text-white flex gap-2 items-center rounded-lg shadow-lg text-lg px-6 py-2"
            onClick={() => router.push("/admin/pos")}
          >
            <ArrowRight className="w-5 h-5" />
            Ir al Punto de Venta
          </Button>
        </div>

        {/* Stats Cards mejorados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Productos"
            value={stats.totalProducts}
            icon={<Package className="h-9 w-9 text-blue-500" />}
            bg="from-blue-100 to-white"
          />
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon={<Users className="h-9 w-9 text-green-500" />}
            bg="from-green-100 to-white"
          />
          <StatCard
            title="Total Pedidos"
            value={stats.totalOrders}
            icon={<ShoppingCart className="h-9 w-9 text-yellow-500" />}
            bg="from-yellow-100 to-white"
          />
          <StatCard
            title="Ingresos Totales"
            value={formatPrice(stats.totalRevenue)}
            icon={<TrendingUp className="h-9 w-9 text-pink-500" />}
            bg="from-pink-100 to-white"
          />
        </div>

        {/* Puedes agregar tablas/listas abajo, por ejemplo: */}
        {/* <RecentOrdersTable orders={recentOrders} /> */}
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, bg }: { title: string, value: any, icon: React.ReactNode, bg: string }) {
  return (
    <div className={`rounded-2xl shadow-md bg-gradient-to-br ${bg} px-7 py-7 flex flex-col items-center border border-gray-200 hover:shadow-xl transition-all duration-300`}>
      <div className="mb-2">{icon}</div>
      <span className="text-4xl font-bold mb-1">{value}</span>
      <span className="text-base text-gray-600 font-medium">{title}</span>
    </div>
  )
}
