"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function WishlistPage() {
  const { user } = useAuth()
  const { wishlistItems, loading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user && !loading) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
  }

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId)
      toast({
        title: "Eliminado de favoritos",
        description: "El producto se eliminó de tu lista de deseos",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1)
      toast({
        title: "Producto agregado",
        description: "El producto se agregó al carrito exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    }
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mi Lista de Deseos</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Tu lista de deseos está vacía</h2>
            <p className="text-gray-500 mb-6">Agrega productos que te gusten para encontrarlos fácilmente después</p>
            <Button onClick={() => router.push("/products")}>Explorar Productos</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.product_id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={item.product.imagen_url || "/placeholder.svg"}
                    alt={item.product.nombre}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.product.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.product.descripcion}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(item.product.precio)}</span>
                    {item.product.tipo === "propio" && item.product.stock !== null && (
                      <span className="text-sm text-gray-500">Stock: {item.product.stock}</span>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(item.product_id)}
                    disabled={item.product.tipo === "propio" && item.product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.product.tipo === "propio" && item.product.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
