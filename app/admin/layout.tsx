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
      <div className="w-full max-w-full px-2 sm:px-4 py-3 sm:py-4">
        <AdminTabs />
      </div>
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        {children}
      </div>
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
    { value: "/admin/ventas", label: "Ventas" }
  ]

  // Determinar la pestaña activa
  const getActiveTab = () => {
    const exactMatch = tabs.find((tab) => tab.value === pathname)
    if (exactMatch) return exactMatch.value
    for (const tab of tabs) {
      if (pathname.startsWith(tab.value) && tab.value !== "/admin") {
        return tab.value
      }
    }
    return "/admin"
  }

  const activeTab = getActiveTab()

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList
        className="
          w-full flex-nowrap flex overflow-x-auto gap-x-2 sm:gap-x-4
          py-1 sm:py-2
          bg-muted rounded-xl
          no-scrollbar
          min-w-0
        "
        style={{
          WebkitOverflowScrolling: "touch",
          overflowY: "hidden", // solo scroll horizontal
        }}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            asChild
            className="min-w-[110px] sm:min-w-[130px] text-sm sm:text-base px-2 sm:px-4 whitespace-nowrap"
          >
            <Link href={tab.value}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>

    </Tabs>
  )
}
