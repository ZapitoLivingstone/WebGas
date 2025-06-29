// components/layout/Header.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Heart, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/providers/auth-provider"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

const navLinks = [
  { label: "INICIO", href: "/" },
  { label: "PRODUCTOS", href: "/products" },
  { label: "NOSOTROS", href: "/about" },
  { label: "CONTACTO", href: "/contact" }
]

export function Header() {
  const { user, userRole, signOut } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente" })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo cerrar sesión", variant: "destructive" })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-[#FFD200] shadow-md sticky top-0 z-50 border-b border-yellow-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo y Marca */}
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image
              src="/logo-plasgas-pequeña.jpeg" // <- Usa aquí la ruta real de tu logo PNG transparente
              alt="PLASGAS"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="font-black text-2xl text-[#C22320] tracking-tight uppercase truncate">PLASGAS</span>
          </Link>

          {/* Botón hamburguesa solo en mobile */}
          <button
            className="lg:hidden flex items-center p-2 text-[#C22320] hover:bg-[#ffe266] rounded transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            <Menu className="h-7 w-7" />
          </button>

          {/* Navegación desktop */}
          <nav className="hidden lg:flex items-center gap-5 flex-shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#C22320] font-semibold text-base px-2 py-1 rounded transition-colors duration-150 hover:bg-[#FFF3C4] hover:text-[#0050A4] focus:bg-[#FFF3C4]"
                style={{ textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            ))}
            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5 text-[#0050A4]" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs bg-[#C22320] text-white">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5 text-[#0050A4]" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs bg-[#FFD200] text-[#C22320] border border-[#C22320]">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5 text-[#C22320]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mi Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Mis Pedidos</Link>
                  </DropdownMenuItem>
                  {userRole === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Panel Admin</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/pos">Punto de Venta</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {userRole === "distribuidor" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/distributor">Panel Distribuidor</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 flex-shrink-0 min-w-max">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login" className="text-[#0050A4] font-bold">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="bg-[#C22320] hover:bg-[#A51B1B] text-white font-bold">
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="flex flex-col gap-2 pt-4 pb-4 px-2 bg-[#FFD200] border-t border-yellow-300 lg:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[#C22320] font-semibold text-base px-2 py-2 rounded transition-colors hover:bg-[#FFF3C4] hover:text-[#0050A4]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5 text-[#0050A4]" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs bg-[#C22320] text-white">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5 text-[#0050A4]" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs bg-[#FFD200] text-[#C22320] border border-[#C22320]">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5 text-[#C22320]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Mis Pedidos</Link>
                    </DropdownMenuItem>
                    {userRole === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Panel Admin</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/pos">Punto de Venta</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {userRole === "distribuidor" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/distributor">Panel Distribuidor</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      disabled={isLoggingOut}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1 mt-2">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login" className="text-[#0050A4] font-bold">Iniciar Sesión</Link>
                  </Button>
                  <Button asChild className="bg-[#C22320] hover:bg-[#A51B1B] text-white font-bold">
                    <Link href="/auth/register">Registrarse</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
