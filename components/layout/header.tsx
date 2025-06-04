"use client"

import type React from "react"

import Link from "next/link"
import { ShoppingCart, Heart, User, Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useState, useEffect } from "react"

export function Header() {
  const { user, userRole, signOut, isConfigured } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [animateCart, setAnimateCart] = useState(false)
  const [animateWishlist, setAnimateWishlist] = useState(false)
  const [prevCartCount, setPrevCartCount] = useState(0)
  const [prevWishlistCount, setPrevWishlistCount] = useState(0)

  // Detectar cambios en los contadores para animar
  useEffect(() => {
    if (cartCount !== prevCartCount) {
      setAnimateCart(true)
      const timer = setTimeout(() => setAnimateCart(false), 1000)
      setPrevCartCount(cartCount)
      return () => clearTimeout(timer)
    }
  }, [cartCount, prevCartCount])

  useEffect(() => {
    if (wishlistCount !== prevWishlistCount) {
      setAnimateWishlist(true)
      const timer = setTimeout(() => setAnimateWishlist(false), 1000)
      setPrevWishlistCount(wishlistCount)
      return () => clearTimeout(timer)
    }
  }, [wishlistCount, prevWishlistCount])

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }


  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GP</span>
            </div>
            <span className="font-bold text-xl">Gásfiter Pro</span>
          </Link>
          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Wishlist */}
                <Link href="/wishlist">
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart className={`h-5 w-5 ${animateWishlist ? "text-red-500" : ""}`} />
                    {wishlistCount > 0 && (
                      <Badge
                        className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
                          animateWishlist ? "animate-bounce bg-red-500" : ""
                        }`}
                      >
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Cart */}
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className={`h-5 w-5 ${animateCart ? "text-green-500" : ""}`} />
                    {cartCount > 0 && (
                      <Badge
                        className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
                          animateCart ? "animate-bounce bg-green-500" : ""
                        }`}
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                      {userRole && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{userRole}</span>
                      )}
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
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
