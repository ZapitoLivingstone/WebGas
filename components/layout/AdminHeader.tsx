"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, X, Home } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

const adminTabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/categories", label: "Categorías" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/ventas", label: "Ventas" },
]

export function AdminHeader() {
  const pathname = usePathname()
  // 👇 usa userRole en vez de user?.role
  const { user, userRole, signOut, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Evita “flash” de rol mientras carga
  const role = (userRole ?? "").toLowerCase()
  const isAdmin = role === "admin"
  const isWorker = role === "trabajador"

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener("mousedown", handleClickOutside)
    return () => window.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Cierra el menú si cambia la ruta
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="w-full bg-white border-b shadow-md sticky top-0 z-40">
      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-8">
        <nav className="flex items-center justify-between py-2 h-16 relative">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <img
              src="/logo-plasgas-sin-fondo-pequeña.png"
              alt="Logo Admin"
              className="h-8 w-8 object-contain"
              draggable={false}
            />
            <span className="font-bold text-xl text-[#C22320] tracking-wide select-none">
              {isAdmin ? "ADMIN" : "TRABAJADOR"}
            </span>
          </div>

          {/* Tabs desktop (solo admin) */}
          {isAdmin && (
            <ul className="hidden xl:flex gap-2 sm:gap-4 flex-1 ml-8">
              {adminTabs.map((tab) => (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className={`
                      px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium transition
                      text-sm sm:text-base
                      ${pathname === tab.href
                        ? "bg-[#C22320]/10 text-[#C22320] font-bold"
                        : "text-gray-700 hover:bg-gray-100"}
                    `}
                    aria-current={pathname === tab.href ? "page" : undefined}
                  >
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Acciones usuario + Volver */}
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/" className="hidden xl:flex">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 font-medium gap-2 hover:bg-gray-50"
                size="sm"
                aria-label="Volver a tienda"
              >
                <Home className="w-4 h-4" />
                Volver a tienda
              </Button>
            </Link>
            <span className="hidden sm:block text-gray-600 text-sm font-semibold">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cerrar sesión"
              onClick={signOut}
              className="hover:bg-[#C22320]/10 text-[#C22320] transition"
              disabled={loading}
            >
              <LogOut className="w-5 h-5" />
            </Button>
            {/* Mobile menu button */}
            <button
              className="xl:hidden ml-2 p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Abrir menú"
              onClick={() => setOpen((o) => !o)}
            >
              <Menu className="w-6 h-6 text-[#C22320]" />
            </button>
          </div>

          {/* Mobile menu */}
          {open && (
            <div
              ref={menuRef}
              className="absolute top-full left-0 right-0 bg-white shadow-lg border-b border-x rounded-b-2xl flex flex-col xl:hidden animate-in fade-in slide-in-from-top-4 z-50"
            >
              <div className="flex justify-between items-center px-4 py-2">
                <span className="font-bold text-lg text-[#C22320]">
                  {isAdmin ? "Menú Admin" : "Menú Trabajador"}
                </span>
                <button
                  aria-label="Cerrar menú"
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-6 h-6 text-[#C22320]" />
                </button>
              </div>

              <Link href="/" onClick={() => setOpen(false)}>
                <div className="flex items-center px-6 py-3 gap-2 font-medium border-b text-gray-700 hover:bg-gray-100">
                  <Home className="w-5 h-5" />
                  Volver a tienda
                </div>
              </Link>

              {isAdmin &&
                adminTabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`
                      px-6 py-3 text-base border-b font-medium
                      ${pathname === tab.href
                        ? "bg-[#C22320]/10 text-[#C22320] font-bold"
                        : "text-gray-700 hover:bg-gray-100"}
                    `}
                    aria-current={pathname === tab.href ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {tab.label}
                  </Link>
                ))}

              <span className="px-6 py-3 text-xs text-gray-500">
                {user?.email}
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
