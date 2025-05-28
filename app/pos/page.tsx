"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Search, Plus, Minus, Trash2 } from "lucide-react"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number | null
  tipo: string
}

interface POSItem {
  product: Product
  quantity: number
}

export default function POSPage() {
  const { user, userRole, loading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [posItems, setPosItems] = useState<POSItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/")
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchProducts()
    }
  }, [user, userRole])

  useEffect(() => {
    const filtered = products.filter((product) => product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized")
      }
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, precio, stock, tipo")
        .eq("activo", true)
        .eq("tipo", "propio") // Solo productos propios para POS

      if (error) throw error
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const addToPOS = (product: Product) => {
    const existingItem = posItems.find((item) => item.product.id === product.id)

    if (existingItem) {
      if (product.stock !== null && existingItem.quantity >= product.stock) {
        toast({
          title: "Stock insuficiente",
          description: "No hay más stock disponible",
          variant: "destructive",
        })
        return
      }

      setPosItems((prev) =>
        prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setPosItems((prev) => [...prev, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromPOS(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && product.stock !== null && newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: "No hay suficiente stock disponible",
        variant: "destructive",
      })
      return
    }

    setPosItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const removeFromPOS = (productId: number) => {
    setPosItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const getTotal = () => {
    return posItems.reduce((total, item) => total + item.product.precio * item.quantity, 0)
  }

  const processSale = async () => {
    if (posItems.length === 0) {
      toast({
        title: "Error",
        description: "Agrega productos a la venta",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Selecciona un método de pago",
        variant: "destructive",
      })
      return
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Supabase client is not initialized",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      // Registrar cada producto vendido en ventas_pos
      for (const item of posItems) {
        const { error } = await supabase.from("ventas_pos").insert({
          admin_id: user?.id,
          producto_id: item.product.id,
          cantidad: item.quantity,
          precio_unitario: item.product.precio,
          metodo_pago: paymentMethod,
        })

        if (error) throw error

        // Actualizar stock
        const { data: currentProduct, error: fetchError } = await supabase
          .from("productos")
          .select("stock")
          .eq("id", item.product.id)
          .single()

        if (fetchError) throw fetchError

        const newStock =
          currentProduct && currentProduct.stock !== null
            ? Math.max(currentProduct.stock - item.quantity, 0)
            : null

        await supabase
          .from("productos")
          .update({
            stock: newStock,
          })
          .eq("id", item.product.id)
      }

      toast({
        title: "Venta procesada",
        description: "La venta se registró exitosamente",
      })

      // Limpiar POS
      setPosItems([])
      setPaymentMethod("")

      // Actualizar productos para reflejar nuevo stock
      await fetchProducts()
    } catch (error) {
      console.error("Error processing sale:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la venta",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
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

  if (!user || userRole !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Punto de Venta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => addToPOS(product)}
                    >
                      <h3 className="font-semibold">{product.nombre}</h3>
                      <p className="text-lg font-bold text-blue-600">{formatPrice(product.precio)}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant={product.stock && product.stock > 0 ? "default" : "destructive"}>
                          Stock: {product.stock || 0}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToPOS(product)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Venta Actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {posItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay productos agregados</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {posItems.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.nombre}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.product.precio)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromPOS(item.product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatPrice(getTotal())}</span>
                      </div>

                      <div>
                        <Label htmlFor="payment_method">Método de Pago</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="efectivo">Efectivo</SelectItem>
                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                            <SelectItem value="transferencia">Transferencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button className="w-full" size="lg" onClick={processSale} disabled={processing}>
                        {processing ? "Procesando..." : "Procesar Venta"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
