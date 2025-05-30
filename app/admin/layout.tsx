"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <div className="container mx-auto px-4 py-4">
        <AdminTabs />
      </div>
      {children}
    </>
  )
}

function AdminTabs() {
  const pathname = usePathname()

  const tabs = [
    { value: "/admin", label: "Dashboard" },
    { value: "/admin/products", label: "Productos" },
    { value: "/admin/categories", label: "Categorías" },
    { value: "/admin/orders", label: "Pedidos" },
    { value: "/admin/users", label: "Usuarios" },
  ]

  // Determinar la pestaña activa
  const getActiveTab = () => {
    // Exact match
    const exactMatch = tabs.find((tab) => tab.value === pathname)
    if (exactMatch) return exactMatch.value

    // Partial match (for nested routes)
    for (const tab of tabs) {
      if (pathname.startsWith(tab.value) && tab.value !== "/admin") {
        return tab.value
      }
    }

    // Default to dashboard
    return "/admin"
  }

  const activeTab = getActiveTab()

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={tab.value}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
