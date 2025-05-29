"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/components/providers/auth-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Search, Plus, Minus, Trash2, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number | null
  tipo: string
  imagen_url: string
}

interface CartItem {
  product: Product
  quantity: number
}

export default function POSPage() {
  const { user, userRole } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    nombre: "",
    email: "",
    telefono: "",
  })

  useEffect(() => {
    if (userRole !== "admin") {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder al punto de venta",
        variant: "destructive",
      })
      return
    }
    fetchProducts()
  }, [userRole])

  const fetchProducts = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("productos").select("*").eq("activo", true).order("nombre")

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)

    if (existingItem) {
      if (product.tipo === "propio" && product.stock !== null) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${product.stock} unidades disponibles`,
            variant: "destructive",
          })
          return
        }
      }

      setCart(cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }

    toast({
      title: "Producto agregado",
      description: `${product.nombre} agregado al carrito`,
    })
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product?.tipo === "propio" && product.stock !== null && newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles`,
        variant: "destructive",
      })
      return
    }

    setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)))
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.product.precio * item.quantity, 0)
  }

  const processOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de procesar la venta",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: "Método de pago requerido",
        description: "Selecciona un método de pago",
        variant: "destructive",
      })
      return
    }

    if (!customerInfo.nombre) {
      toast({
        title: "Información del cliente requerida",
        description: "Ingresa al menos el nombre del cliente",
        variant: "destructive",
      })
      return
    }

    setProcessingOrder(true)

    try {
      if (!supabase || !user) throw new Error("No hay conexión a la base de datos")

      // Crear la orden
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: getTotal(),
          estado: "completado",
          metodo_pago: paymentMethod,
          direccion_envio: "Venta en tienda",
          cliente_nombre: customerInfo.nombre,
          cliente_email: customerInfo.email || null,
          cliente_telefono: customerInfo.telefono || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Crear los items de la orden
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.precio,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Actualizar stock para productos propios
      for (const item of cart) {
        if (item.product.tipo === "propio" && item.product.stock !== null) {
          const { error: stockError } = await supabase
            .from("productos")
            .update({ stock: item.product.stock - item.quantity })
            .eq("id", item.product.id)

          if (stockError) throw stockError
        }
      }

      toast({
        title: "Venta procesada",
        description: `Orden #${orderData.id} creada exitosamente`,
      })

      // Limpiar carrito y formulario
      setCart([])
      setCustomerInfo({ nombre: "", email: "", telefono: "" })
      setPaymentMethod("")

      // Recargar productos para actualizar stock
      fetchProducts()
    } catch (error) {
      console.error("Error processing order:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la venta",
        variant: "destructive",
      })
    } finally {
      setProcessingOrder(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
  }

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder al punto de venta.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Punto de Venta</h1>
        <p className="text-gray-600">Sistema de ventas para la tienda física</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
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
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{product.nombre}</h3>
                          {product.tipo === "propio" && product.stock !== null && (
                            <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                              Stock: {product.stock}
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg font-bold text-blue-600 mb-2">{formatPrice(product.precio)}</p>
                        <Button
                          onClick={() => addToCart(product)}
                          className="w-full"
                          disabled={product.tipo === "propio" && product.stock === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout Section */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrito ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Carrito vacío</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.nombre}</h4>
                        <p className="text-sm text-gray-600">{formatPrice(item.product.precio)} c/u</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.product.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Nombre del cliente *"
                value={customerInfo.nombre}
                onChange={(e) => setCustomerInfo({ ...customerInfo, nombre: e.target.value })}
              />
              <Input
                placeholder="Email (opcional)"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              />
              <Input
                placeholder="Teléfono (opcional)"
                value={customerInfo.telefono}
                onChange={(e) => setCustomerInfo({ ...customerInfo, telefono: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta Débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta Crédito</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Process Order */}
          <Button onClick={processOrder} disabled={cart.length === 0 || processingOrder} className="w-full" size="lg">
            {processingOrder ? "Procesando..." : "Procesar Venta"}
          </Button>
        </div>
      </div>
    </div>
  )
}
