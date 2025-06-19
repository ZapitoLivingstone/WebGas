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
      <div className="w-screen -mx-4 sm:w-full sm:mx-0 py-3 sm:py-4">
        <AdminTabs />
      </div>
      <div className="">
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
    <div className="overflow-x-auto no-scrollbar px-1 sm:px-0 w-full">
      <Tabs value={activeTab} className="w-full">
        <TabsList
          className="
            flex flex-nowrap overflow-x-auto no-scrollbar w-full
            bg-muted rounded-xl gap-1 sm:gap-3 md:gap-6
            py-1 sm:py-2
            snap-x
          "
          style={{
            WebkitOverflowScrolling: "touch",
            overflowY: "hidden",
          }}
        >
          {tabs.map((tab, idx) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
              className={`
                min-w-[60px] max-w-[80px]
                sm:min-w-[120px] sm:max-w-[180px] 
                md:min-w-[160px] md:max-w-[240px]
                px-1 sm:px-4 md:px-6
                py-2
                text-[12px] sm:text-base md:text-lg
                whitespace-nowrap
                text-center
                snap-start
                ${idx === 0 ? "ml-4" : ""}
                ${idx === tabs.length - 1 ? "mr-1" : ""}
              `}
            >
              <Link href={tab.value}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}




