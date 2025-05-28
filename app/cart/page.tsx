"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/providers/auth-provider"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function CartPage() {
  const { user } = useAuth()
  const { cartItems, loading, updateQuantity, removeFromCart, getCartTotal } = useCart()
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

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeFromCart(productId)
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    router.push("/checkout")
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
        <h1 className="text-3xl font-bold mb-8">Mi Carrito</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-6">Agrega algunos productos para comenzar</p>
            <Button onClick={() => router.push("/products")}>Explorar Productos</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.product_id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={item.product.imagen_url || "/placeholder.svg"}
                        alt={item.product.nombre}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.nombre}</h3>
                        <p className="text-gray-600">{formatPrice(item.product.precio)}</p>
                        {item.product.tipo === "propio" && item.product.stock !== null && (
                          <p className="text-sm text-gray-500">Stock disponible: {item.product.stock}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product_id, Number.parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                          min="1"
                          max={item.product.stock || undefined}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          disabled={
                            item.product.tipo === "propio" &&
                            item.product.stock !== null &&
                            item.quantity >= item.product.stock
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatPrice(item.product.precio * item.quantity)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceder al Pago
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
