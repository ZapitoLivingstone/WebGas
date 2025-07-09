"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

import { POSCategorySidebar } from "@/components/pos/POSCategorySidebar"
import { POSProductGrid } from "@/components/pos/POSProductGrid"
import { POSCartPanel } from "@/components/pos/POSCartPanel"
import { POSPaymentPanel } from "@/components/pos/POSPaymentPanel"

import type { Product, Categoria, CartItem } from "@/lib/types"

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
    if (!["admin", "trabajador"].includes(userRole ?? "")) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder al POS",
        variant: "destructive",
      })
      return
    }
    fetchData()
    // eslint-disable-next-line
  }, [userRole])

  const fetchData = async () => {
    setLoading(true)
    const { data: productosData } = await supabase
      .from("productos")
      .select("*, categorias(nombre)")
      .eq("activo", true)
      .eq("tipo", "propio")
    const { data: categoriasData } = await supabase
      .from("categorias")
      .select("id, nombre")
      .order("nombre")
    const productos: Product[] = (productosData || []).map((p: any) => ({
      ...p,
      categoria_nombre:
        typeof p.categorias?.nombre === "string"
          ? p.categorias.nombre
          : undefined
    })).map((p: Product) => ({
      ...p,
      categoria_nombre: p.categoria_nombre === null ? undefined : p.categoria_nombre
    }))

    setProducts(productos)
    setCategories(categoriasData || [])
    setLoading(false)
  }

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id)
    if (existing) {
      if (
        product.tipo === "propio" &&
        product.stock !== null &&
        existing.quantity >= product.stock
      ) {
        toast({ title: "Stock insuficiente", variant: "destructive" })
        return
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else setCart([...cart, { product, quantity: 1 }])
  }

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) return setCart(cart.filter((i) => i.product.id !== id))
    const prod = products.find((p) => p.id === id)
    if (prod?.tipo === "propio" && prod.stock !== null && qty > prod.stock) {
      toast({ title: "Stock insuficiente", variant: "destructive" })
      return
    }
    setCart(
      cart.map((item) =>
        item.product.id === id ? { ...item, quantity: qty } : item
      )
    )
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
  const vuelto =
    paymentMethod === "efectivo"
      ? (parseInt(efectivoIngresado) || 0) - getTotalFinal()
      : 0

  function normalize(str?: string | null) {
    return (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
  }
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n)
  const filtered = products
    .map((p) => ({
      ...p,
      categoria_nombre: p.categoria_nombre === null ? undefined : p.categoria_nombre
    }))
    .filter((p) => {
      const nombre = normalize(p.nombre)
      const categoria = normalize(p.categoria_nombre)
      const search = normalize(searchTerm)
      const matchesSearch = nombre.includes(search) || categoria.includes(search)
      const matchesCategory = selectedCategory ? p.categoria_id === selectedCategory : true
      return matchesSearch && matchesCategory
    })

  const processOrder = async () => {
    setShowConfirmModal(false)
    if (!user || cart.length === 0 || !paymentMethod) {
      toast({ title: "Campos requeridos", variant: "destructive" })
      return
    }
    setProcessingOrder(true)
    const { data: venta, error } = await supabase
      .from("ventas_pos")
      .insert({
        admin_id: user.id,
        metodo_pago: paymentMethod,
        total_bruto: getTotalBruto(),
        descuento_total: getDescuentoValor(),
        total_final: getTotalFinal(),
      })
      .select()
      .single()
    if (error || !venta) {
      toast({ title: "Error al guardar venta", variant: "destructive" })
      setProcessingOrder(false)
      return
    }
    const detalles = cart.map((i) => ({
      venta_id: venta.id,
      producto_id: i.product.id,
      cantidad: i.quantity,
      precio_unitario: i.product.precio,
      subtotal: i.product.precio * i.quantity,
    }))
    const { error: detError } = await supabase.from("detalle_ventas_pos").insert(detalles)
    if (detError) {
      toast({ title: "Error al guardar detalles", variant: "destructive" })
      setProcessingOrder(false)
      return
    }
    for (const item of cart) {
      if (item.product.tipo === "propio" && item.product.stock !== null) {
        await supabase
          .from("productos")
          .update({ stock: item.product.stock - item.quantity })
          .eq("id", item.product.id)
      }
    }
    toast({ title: "Venta registrada correctamente" })
    setCart([])
    setPaymentMethod("")
    setEfectivoIngresado("")
    setDescuentoGlobal("")
    setShowDescuentoInput(false)
    fetchData()
    setProcessingOrder(false)
  }

  if (!["admin", "trabajador"].includes(userRole ?? "")) {
    return <div className="p-8 text-center text-xl">Acceso denegado</div>
  }

  return (
    <div className="w-full max-w-screen-2xl px-2 sm:px-6 py-4 sm:py-8 mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-[#C22320] text-center">
        Punto de Venta
      </h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <POSCategorySidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <main className="lg:w-3/5 w-full">
          <POSProductGrid
            products={filtered}
            loading={loading}
            addToCart={addToCart}
            formatPrice={formatPrice}
          />
        </main>
        <section className="lg:w-1/5 w-full flex flex-col space-y-4">
          <POSCartPanel
            cart={cart}
            updateQuantity={updateQuantity}
            showDescuentoInput={showDescuentoInput}
            setShowDescuentoInput={setShowDescuentoInput}
            descuentoGlobal={descuentoGlobal}
            setDescuentoGlobal={setDescuentoGlobal}
            getTotalFinal={getTotalFinal}
            formatPrice={formatPrice}
          />
          <POSPaymentPanel
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            efectivoIngresado={efectivoIngresado}
            setEfectivoIngresado={setEfectivoIngresado}
            vuelto={vuelto}
            formatPrice={formatPrice}
          />
          {/* Confirmar venta */}
          <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogTrigger asChild>
              <Button
                disabled={processingOrder || cart.length === 0}
                className="w-full text-lg font-semibold bg-[#C22320] hover:bg-[#a31916]"
                size="lg"
                onClick={() => setShowConfirmModal(true)}
              >
                {processingOrder ? "Procesando..." : "Registrar Venta"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Confirmar venta?</DialogTitle>
              </DialogHeader>
              <p>Total a pagar: {formatPrice(getTotalFinal())}</p>
              {paymentMethod === "efectivo" && (
                <p>
                  Efectivo ingresado: {formatPrice(parseInt(efectivoIngresado) || 0)} - Vuelto:{" "}
                  {formatPrice(vuelto)}
                </p>
              )}
              <DialogFooter>
                <Button onClick={() => setShowConfirmModal(false)} variant="outline">
                  Cancelar
                </Button>
                <Button onClick={processOrder}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  )
}
