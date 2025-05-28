"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir navegación del Link
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
      await addToCart(product.id, 1)
      toast({
        title: "Producto agregado",
        description: `${product.nombre} se agregó al carrito exitosamente`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir navegación del Link
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
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id)
        toast({
          title: "Eliminado de favoritos",
          description: "El producto se eliminó de tu lista de deseos",
        })
      } else {
        await addToWishlist(product.id)
        toast({
          title: "Agregado a favoritos",
          description: "El producto se agregó a tu lista de deseos",
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la lista de deseos",
        variant: "destructive",
      })
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
    <Card className="group hover:shadow-lg transition-shadow">
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
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
          onClick={handleToggleWishlist}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
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
        <Button className="w-full" onClick={handleAddToCart} disabled={isOutOfStock}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}
