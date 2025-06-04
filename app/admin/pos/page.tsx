// app/pos/page.tsx (actualizado)
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { Plus, Minus, Tag } from "lucide-react"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number | null
  tipo: string
  imagen_url: string
  categoria_id?: number
  categoria_nombre?: string
}

interface Categoria {
  id: number
  nombre: string
}

interface CartItem {
  product: Product
  quantity: number
}

export default function POSVentasPage() {
  const { user, userRole } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [efectivoIngresado, setEfectivoIngresado] = useState("")
  const [descuentoGlobal, setDescuentoGlobal] = useState("")
  const [showDescuentoInput, setShowDescuentoInput] = useState(false)

  useEffect(() => {
    if (userRole !== "admin") {
      toast({ title: "Acceso denegado", description: "No tienes permisos para acceder al POS", variant: "destructive" })
      return
    }
    fetchData()
  }, [userRole])

  const fetchData = async () => {
    const { data: productosData, error: prodError } = await supabase
      .from("productos")
      .select("*, categorias(nombre)")
      .eq("activo", true)

    const { data: categoriasData, error: catError } = await supabase
      .from("categorias")
      .select("id, nombre")
      .order("nombre")

    if (prodError || catError) {
      console.error(prodError || catError)
      return
    }

    const productos = (productosData || []).map(p => ({
      ...p,
      categoria_nombre: p.categorias?.nombre || null
    }))

    setProducts(productos)
    setCategories(categoriasData || [])
    setLoading(false)
  }

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id)
    if (existing) {
      if (product.tipo === "propio" && product.stock !== null && existing.quantity >= product.stock) {
        toast({ title: "Stock insuficiente", variant: "destructive" }); return
      }
      setCart(cart.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) return setCart(cart.filter((i) => i.product.id !== id))
    const prod = products.find((p) => p.id === id)
    if (prod?.tipo === "propio" && prod.stock !== null && qty > prod.stock) {
      toast({ title: "Stock insuficiente", variant: "destructive" }); return
    }
    setCart(cart.map((item) => item.product.id === id ? { ...item, quantity: qty } : item))
  }

  const getTotalBruto = () => cart.reduce((t, i) => t + i.product.precio * i.quantity, 0)

  const getDescuentoValor = () => {
    if (!descuentoGlobal.trim()) return 0
    if (descuentoGlobal.trim().endsWith("%")) {
      const porcentaje = parseFloat(descuentoGlobal.replace("%", ""))
      return isNaN(porcentaje) ? 0 : getTotalBruto() * (porcentaje / 100)
    }
    const monto = parseFloat(descuentoGlobal)
    return isNaN(monto) ? 0 : monto
  }

  const getTotalFinal = () => getTotalBruto() - getDescuentoValor()
  const vuelto = paymentMethod === "efectivo" ? (parseInt(efectivoIngresado) || 0) - getTotalFinal() : 0

  const processOrder = async () => {
    setShowConfirmModal(false)
    if (!user || cart.length === 0 || !paymentMethod) {
      toast({ title: "Campos requeridos", variant: "destructive" }); return
    }

    setProcessingOrder(true)
    const { data: venta, error } = await supabase.from("ventas_pos").insert({
      admin_id: user.id,
      metodo_pago: paymentMethod,
      total_bruto: getTotalBruto(),
      descuento_total: getDescuentoValor(),
      total_final: getTotalFinal()
    }).select().single()

    if (error || !venta) {
      toast({ title: "Error al guardar venta", variant: "destructive" }); setProcessingOrder(false); return
    }

    const detalles = cart.map((i) => ({
      venta_id: venta.id,
      producto_id: i.product.id,
      cantidad: i.quantity,
      precio_unitario: i.product.precio,
      subtotal: i.product.precio * i.quantity
    }))
    const { error: detError } = await supabase.from("detalle_ventas_pos").insert(detalles)
    if (detError) {
      toast({ title: "Error al guardar detalles", variant: "destructive" }); setProcessingOrder(false); return
    }

    for (const item of cart) {
      if (item.product.tipo === "propio" && item.product.stock !== null) {
        await supabase.from("productos").update({ stock: item.product.stock - item.quantity }).eq("id", item.product.id)
      }
    }

    toast({ title: "Venta registrada correctamente" })
    setCart([]); setPaymentMethod(""); setEfectivoIngresado(""); setDescuentoGlobal(""); setShowDescuentoInput(false); fetchData(); setProcessingOrder(false)
  }

  const formatPrice = (n: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n)
  const filtered = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? p.categoria_id === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  if (userRole !== "admin") return <div className="p-8 text-center">Acceso denegado</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Punto de Venta (POS)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar: Categorías */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div>
            <h2 className="text-md font-semibold">Categorías</h2>
            <Button onClick={() => setSelectedCategory(null)} variant={!selectedCategory ? "default" : "outline"} size="sm" className="mb-1 w-full">Todas</Button>
            {categories.map((cat) => (
              <Button key={cat.id} onClick={() => setSelectedCategory(cat.id)} variant={selectedCategory === cat.id ? "default" : "outline"} size="sm" className="mb-1 w-full">
                {cat.nombre}
              </Button>
            ))}
          </div>
        </div>

        {/* Productos */}
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
            {loading ? <p>Cargando...</p> : filtered.map((product) => (
              <Card key={product.id} className="p-4 cursor-pointer hover:shadow" onClick={() => addToCart(product)}>
                <h3 className="font-semibold text-sm">{product.nombre}</h3>
                <p className="text-blue-600 font-bold">{formatPrice(product.precio)}</p>
                {product.tipo === "propio" && product.stock !== null && (
                  <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>Stock: {product.stock}</Badge>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Carrito y Pago */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle></CardTitle></CardHeader>
            <CardContent>
              {cart.length === 0 ? <p></p> : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{item.product.nombre}</p>
                        <p className="text-xs text-gray-500">{formatPrice(item.product.precio)} c/u</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                        <span>{item.quantity}</span>
                        <Button size="sm" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-4" />

                  <Button onClick={() => setShowDescuentoInput(!showDescuentoInput)} variant="outline" size="sm" className="w-full">
                    <Tag className="h-4 w-4 mr-2" /> Aplicar descuento global
                  </Button>

                  {showDescuentoInput && (
                    <Input
                      placeholder="Ej: 10% o 1000"
                      value={descuentoGlobal}
                      onChange={(e) => setDescuentoGlobal(e.target.value)}
                    />
                  )}

                  <p>Total: <strong>{formatPrice(getTotalFinal())}</strong></p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Método de pago</CardTitle></CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta Débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta Crédito</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
              {paymentMethod === 'efectivo' && (
                <div className="mt-4">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Efectivo recibido"
                    value={efectivoIngresado}
                    onChange={(e) => setEfectivoIngresado(e.target.value)}
                  />
                  <p className="text-sm mt-2">Vuelto: <strong>{formatPrice(vuelto >= 0 ? vuelto : 0)}</strong></p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogTrigger asChild>
              <Button disabled={processingOrder || cart.length === 0} className="w-full" size="lg">
                {processingOrder ? "Procesando..." : "Registrar Venta"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Confirmar venta?</DialogTitle>
              </DialogHeader>
              <p>Total a pagar: {formatPrice(getTotalFinal())}</p>
              {paymentMethod === 'efectivo' && (
                <p>Efectivo ingresado: {formatPrice(parseInt(efectivoIngresado) || 0)} - Vuelto: {formatPrice(vuelto)}</p>
              )}
              <DialogFooter>
                <Button onClick={() => setShowConfirmModal(false)} variant="outline">Cancelar</Button>
                <Button onClick={processOrder}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
