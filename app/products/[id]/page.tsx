"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/components/providers/auth-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useToast } from "@/hooks/use-toast"
import { Heart, ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react"

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
  categoria?: {
    id: number
    nombre: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct(Number.parseInt(params.id as string))
    }
  }, [params.id])

  const fetchProduct = async (id: number) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from("productos")
        .select(`
          *,
          categoria:categorias(id, nombre)
        `)
        .eq("id", id)
        .eq("activo", true)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    try {
      await addToCart(product.id, quantity)
      toast({
        title: "Producto agregado",
        description: `${product.nombre} se agregó al carrito`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    }
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para usar la lista de deseos",
        variant: "destructive",
      })
      return
    }

    if (!product) return

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

  const isOutOfStock = product?.tipo === "propio" && product?.stock === 0
  const maxQuantity = product?.tipo === "propio" ? product?.stock || 1 : 10

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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
            <Button onClick={() => router.push("/products")}>Volver a productos</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imagen del producto */}
          <div>
            <Image
              src={product.imagen_url || "/placeholder.svg?height=500&width=500"}
              alt={product.nombre}
              width={500}
              height={500}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.categoria && <Badge variant="secondary">{product.categoria.nombre}</Badge>}
                {product.tipo === "dropshipping" && <Badge variant="outline">Dropshipping</Badge>}
                {isOutOfStock && <Badge variant="destructive">Sin Stock</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.nombre}</h1>
              <p className="text-gray-600 text-lg mb-6">{product.descripcion}</p>
            </div>

            <div className="border-t border-b py-6">
              <div className="text-4xl font-bold text-blue-600 mb-4">{formatPrice(product.precio)}</div>
              {product.tipo === "propio" && product.stock !== null && (
                <p className="text-gray-600">
                  Stock disponible: <span className="font-semibold">{product.stock} unidades</span>
                </p>
              )}
            </div>

            {/* Controles de cantidad y botones */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Cantidad:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(maxQuantity, Number.parseInt(e.target.value) || 1)))
                    }
                    className="w-20 text-center border-0"
                    min="1"
                    max={maxQuantity}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={isOutOfStock}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
                </Button>
                <Button variant="outline" size="lg" onClick={handleToggleWishlist}>
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Información adicional */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Información del Producto</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="capitalize">{product.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categoría:</span>
                    <span>{product.categoria?.nombre}</span>
                  </div>
                  {product.tipo === "propio" && (
                    <div className="flex justify-between">
                      <span>Disponibilidad:</span>
                      <span>{product.stock ? `${product.stock} en stock` : "Sin stock"}</span>
                    </div>
                  )}
                  {product.tipo === "dropshipping" && (
                    <div className="flex justify-between">
                      <span>Envío:</span>
                      <span>Directo del proveedor</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
