"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface Product {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen_url: string
  tipo: "propio" | "dropshipping"
  stock: number | null
  activo: boolean
  categoria_id: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [justAddedToCart, setJustAddedToCart] = useState(false)
  const [justToggledWishlist, setJustToggledWishlist] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAddingToCart(true)
      await addToCart(product.id, 1)

      // Mostrar feedback visual inmediato
      setJustAddedToCart(true)
      setTimeout(() => setJustAddedToCart(false), 2000)

      toast({
        title: "¡Agregado al carrito!",
        description: `${product.nombre} se agregó exitosamente`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para usar la lista de deseos",
        variant: "destructive",
      })
      return
    }

    try {
      setIsTogglingWishlist(true)
      const wasInWishlist = isInWishlist(product.id)

      if (wasInWishlist) {
        await removeFromWishlist(product.id)
        toast({
          title: "Eliminado de favoritos",
          description: "El producto se eliminó de tu lista de deseos",
          duration: 3000,
        })
      } else {
        await addToWishlist(product.id)
        toast({
          title: "¡Agregado a favoritos!",
          description: "El producto se agregó a tu lista de deseos",
          duration: 3000,
        })
      }

      // Mostrar feedback visual inmediato
      setJustToggledWishlist(true)
      setTimeout(() => setJustToggledWishlist(false), 2000)
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la lista de deseos",
        variant: "destructive",
      })
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
  }

  const isOutOfStock = product.tipo === "propio" && product.stock === 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imagen_url || "/placeholder.svg?height=300&width=300"}
            alt={product.nombre}
            width={300}
            height={300}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.tipo === "dropshipping" && <Badge variant="secondary">Dropshipping</Badge>}
          {isOutOfStock && <Badge variant="destructive">Sin Stock</Badge>}
          {justAddedToCart && (
            <Badge className="bg-green-500 animate-bounce">
              <Check className="h-3 w-3 mr-1" />
              ¡Agregado!
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/80 hover:bg-white ${
            justToggledWishlist ? "animate-pulse scale-110" : ""
          }`}
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`}
          />
        </Button>
      </div>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">{product.nombre}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.descripcion}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">{formatPrice(product.precio)}</span>
          {product.tipo === "propio" && product.stock !== null && (
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className={`w-full transition-all duration-300 ${justAddedToCart ? "bg-green-500 hover:bg-green-600" : ""}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Agregando...
            </>
          ) : justAddedToCart ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              ¡Agregado!
            </>
          ) : isOutOfStock ? (
            "Sin Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar al Carrito
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
