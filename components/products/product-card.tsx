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

  const handleAddToCart = async () => {
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

  const handleToggleWishlist = async () => {
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
    <Card className="group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition-all duration-200 h-full flex flex-col">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imagen_url || "/placeholder.svg"}
            alt={product.nombre}
            width={400}
            height={400}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.tipo === "dropshipping" && (
            <Badge className="bg-gray-200 text-gray-700 font-medium">Dropshipping</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="font-semibold">Sin Stock</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 rounded-full p-1 bg-white shadow group-hover:bg-gray-100 transition-all"
          onClick={handleToggleWishlist}
        >
          <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"}`} />
        </Button>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-[#0050A4] transition-colors line-clamp-1">
            {product.nombre}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.descripcion}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-gray-900">{formatPrice(product.precio)}</span>
          {product.tipo === "propio" && product.stock !== null && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
              Stock: {product.stock}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full rounded-xl font-semibold bg-[#0050A4] text-white hover:bg-[#02376d] transition"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}
