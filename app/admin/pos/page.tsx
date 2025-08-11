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
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

import { POSCategorySidebar } from "@/components/pos/POSCategorySidebar"
import { POSProductGrid } from "@/components/pos/POSProductGrid"
import { POSCartPanel } from "@/components/pos/POSCartPanel"
import { POSPaymentPanel } from "@/components/pos/POSPaymentPanel"
import { POSCajaTurnoBar } from "@/components/pos/POSCajaTurnoBar"
import { POSDialogIniciarTurno } from "@/components/pos/POSDialogIniciarTurno"
import { POSDialogResumenTurno } from "@/components/pos/POSDialogResumenTurno"

import type { Product, Categoria, CartItem } from "@/lib/types"

export default function POSVentasPage() {
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  // Productos/categorías
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])

  // Carrito y venta
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

  // Turnos
  const [turnoAbierto, setTurnoAbierto] = useState<any>(null)
  const [modalTurno, setModalTurno] = useState(false)
  const [efectivoInicial, setEfectivoInicial] = useState("")
  const [resumenModal, setResumenModal] = useState(false)
  const [resumenVentas, setResumenVentas] = useState<any>(null)

  // Carga inicial + turno
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
    fetchTurnoAbierto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, user?.id])

  // Realtime: escuchar cambios de stock en productos
  useEffect(() => {
    if (!["admin", "trabajador"].includes(userRole ?? "")) return

    const channel = supabase
      .channel("pos-stock")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "productos" },
        (payload) => {
          const row = payload.new as any
          // Opcional: filtrar solo tipo 'propio'
          // if ((row?.tipo ?? "").toLowerCase() !== "propio") return

          setProducts((prev) =>
            prev.map((p) =>
              p.id === row.id
                ? {
                    ...p,
                    stock: row.stock,
                    // Si cambian otros campos relevantes:
                    precio: row.precio ?? p.precio,
                    activo: row.activo ?? p.activo,
                  }
                : p
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userRole])

  // Polling de respaldo cada 30s
  useEffect(() => {
    if (!["admin", "trabajador"].includes(userRole ?? "")) return
    const id = setInterval(() => {
      fetchData()
    }, 30000) // 30s
    return () => clearInterval(id)
  }, [userRole])

  // 1. Productos/Categorías
  const fetchData = async () => {
    setLoading(true)
    const { data: productosData, error: prodErr } = await supabase
      .from("productos")
      .select("*, categorias(nombre)")
      .eq("activo", true)
      .eq("tipo", "propio")

    const { data: categoriasData, error: catErr } = await supabase
      .from("categorias")
      .select("id, nombre")
      .order("nombre")

    if (prodErr) {
      console.error("[productos.select] error:", prodErr)
    }
    if (catErr) {
      console.error("[categorias.select] error:", catErr)
    }

    const productos: Product[] = (productosData || [])
      .map((p: any) => ({
        ...p,
        categoria_nombre: typeof p.categorias?.nombre === "string" ? p.categorias.nombre : undefined,
      }))
      .map((p: Product) => ({
        ...p,
        categoria_nombre: p.categoria_nombre === null ? undefined : p.categoria_nombre,
      }))

    setProducts(productos)
    setCategories(categoriasData || [])
    setLoading(false)
  }

  // 2. Estado turno de caja
  const fetchTurnoAbierto = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("turnos_caja")
      .select("*")
      .eq("usuario_id", user.id)
      .eq("abierto", true)
      .order("inicio", { ascending: false })
      .limit(1)
      .maybeSingle()
    setTurnoAbierto(data || null)
    if (error) console.error("Error al consultar turno abierto:", error)
  }

  // 3. Abrir turno
  const handleIniciarTurno = async () => {
    if (!user || !efectivoInicial) return
    if (turnoAbierto) {
      toast({ title: "Ya tienes un turno abierto", variant: "destructive" })
      setModalTurno(false)
      return
    }
    const { error } = await supabase.from("turnos_caja").insert([
      {
        usuario_id: user.id,
        usuario_email: user.email,
        inicio: new Date().toISOString(),
        efectivo_inicial: Number(efectivoInicial),
        abierto: true,
      },
    ])
    if (error) {
      toast({ title: "Error al iniciar turno", variant: "destructive" })
      return
    }
    toast({ title: "Turno iniciado correctamente" })
    setModalTurno(false)
    setEfectivoInicial("")
    fetchTurnoAbierto()
  }

  // 4. Cerrar turno
  const handleTerminarTurno = async () => {
    if (!user || !turnoAbierto) return

    const { data: ventas } = await supabase
      .from("ventas_pos")
      .select("*")
      .gte("fecha", turnoAbierto.inicio)
      .eq("admin_id", user.id)

    const resumen = {
      efectivo: 0,
      debito: 0,
      credito: 0,
      transferencia: 0,
      total: 0,
      ventas: [] as any[],
    }

    for (const venta of ventas || []) {
      resumen.ventas.push(venta)
      resumen.total += venta.total_final
      switch (venta.metodo_pago) {
        case "efectivo":
          resumen.efectivo += venta.total_final
          break
        case "tarjeta_debito":
          resumen.debito += venta.total_final
          break
        case "tarjeta_credito":
          resumen.credito += venta.total_final
          break
        case "transferencia":
          resumen.transferencia += venta.total_final
          break
      }
    }

    setResumenVentas(resumen)
    setResumenModal(true)
  }

  // 5. Confirmar cierre de turno
  const handleConfirmarCierre = async () => {
    if (!turnoAbierto || !resumenVentas) return

    const efectivoInicialNum = parseFloat(turnoAbierto.efectivo_inicial) || 0
    const efectivoVentas = parseFloat(resumenVentas.efectivo) || 0
    const efectivoFinal = efectivoInicialNum + efectivoVentas

    const { error } = await supabase
      .from("turnos_caja")
      .update({
        fin: new Date().toISOString(),
        efectivo_final: efectivoFinal,
        abierto: false,
      })
      .eq("id", turnoAbierto.id)

    if (error) {
      toast({ title: "Error al cerrar turno", variant: "destructive" })
      return
    }

    toast({ title: "Turno cerrado correctamente" })
    setResumenModal(false)
    setTurnoAbierto(null)
    setResumenVentas(null)
    fetchTurnoAbierto()
  }

  // 6. Flujo de ventas
  const addToCart = (product: Product) => {
    if (!turnoAbierto) {
      toast({ title: "Debes iniciar un turno antes de vender", variant: "destructive" })
      return
    }
    const existing = cart.find((item) => item.product.id === product.id)
    if (existing) {
      if (product.tipo === "propio" && product.stock !== null && existing.quantity >= product.stock) {
        toast({ title: "Stock insuficiente", variant: "destructive" })
        return
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) return setCart(cart.filter((i) => i.product.id !== id))
    const prod = products.find((p) => p.id === id)
    if (prod?.tipo === "propio" && prod.stock !== null && qty > prod.stock) {
      toast({ title: "Stock insuficiente", variant: "destructive" })
      return
    }
    setCart(cart.map((item) => (item.product.id === id ? { ...item, quantity: qty } : item)))
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

  function normalize(str?: string | null) {
    return (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
  }
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n)

  const filtered = products
    .map((p) => ({ ...p, categoria_nombre: p.categoria_nombre === null ? undefined : p.categoria_nombre }))
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
      toast({
        title: "Campos requeridos",
        description: "Selecciona método de pago y agrega productos.",
        variant: "destructive",
      })
      return
    }

    setProcessingOrder(true)
    try {
      // 1) Insertar venta POS (cabecera)
      const totalBruto = getTotalBruto()
      const descuento = getDescuentoValor()

      const { data: venta, error: ventaErr } = await supabase
        .from("ventas_pos")
        .insert({
          admin_id: user.id,
          metodo_pago: paymentMethod,
          total_bruto: totalBruto,
          descuento_total: descuento,
          total_final: totalBruto - descuento,
          fecha: new Date().toISOString(),
        })
        .select()
        .single()

      if (ventaErr || !venta) {
        console.error("[ventas_pos.insert] error:", ventaErr)
        toast({ title: "Error al guardar venta", variant: "destructive" })
        setProcessingOrder(false)
        return
      }

      // 2) Insertar detalles
      const detalles = cart.map((i) => ({
        venta_id: venta.id,
        producto_id: i.product.id,
        cantidad: i.quantity,
        precio_unitario: i.product.precio,
        subtotal: i.product.precio * i.quantity,
      }))
      const { error: detErr } = await supabase.from("detalle_ventas_pos").insert(detalles)
      if (detErr) {
        console.error("[detalle_ventas_pos.insert] error:", detErr)
        toast({ title: "Error al guardar detalles", variant: "destructive" })
        setProcessingOrder(false)
        return
      }

      // 3) Descontar stock desde el front: leer y restar (uno por uno)
      for (const item of cart) {
        if ((item.product.tipo ?? "").toLowerCase() !== "propio") continue

        // Lee stock actual
        const { data: prod, error: prodErr } = await supabase
          .from("productos")
          .select("id, stock")
          .eq("id", item.product.id)
          .maybeSingle()

        if (prodErr) {
          console.error(`[productos.select] id=${item.product.id}`, prodErr)
          toast({
            title: "No se pudo leer stock de un producto",
            description: `ID ${item.product.id}`,
            variant: "destructive",
          })
          continue
        }

        const current = Number(prod?.stock ?? 0)
        const after = current - item.quantity
        if (after < 0) {
          console.warn(
            `Stock insuficiente para producto ${item.product.id}. Actual=${current}, solicitado=${item.quantity}`
          )
          toast({
            title: "Stock insuficiente al descontar",
            description: `Producto ID ${item.product.id}`,
            variant: "destructive",
          })
          continue
        }

        const { error: updErr } = await supabase
          .from("productos")
          .update({ stock: after })
          .eq("id", item.product.id)

        if (updErr) {
          console.error(`[productos.update] id=${item.product.id}`, updErr)
          toast({
            title: "No se pudo actualizar stock",
            description: `Producto ID ${item.product.id}`,
            variant: "destructive",
          })
        } else {
          // Actualización optimista local (se verá al tiro)
          setProducts((prev) =>
            prev.map((p) => (p.id === item.product.id ? { ...p, stock: after } : p))
          )
        }
      }

      toast({ title: "Venta registrada correctamente" })

      // Limpia UI
      setCart([])
      setPaymentMethod("")
      setEfectivoIngresado("")
      setDescuentoGlobal("")
      setShowDescuentoInput(false)

      // Refetch como respaldo
      await fetchData()
    } catch (e: any) {
      console.error("[processOrder] error:", e)
      toast({ title: "Error inesperado", description: "Intenta nuevamente.", variant: "destructive" })
    } finally {
      setProcessingOrder(false)
    }
  }

  if (!["admin", "trabajador"].includes(userRole ?? "")) {
    return <div className="p-8 text-center text-xl">Acceso denegado</div>
  }

  return (
    <div className="w-full max-w-screen-2xl px-2 sm:px-6 py-4 sm:py-8 mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-[#C22320] text-center">
        Punto de Venta
      </h1>

      {/* Barra de turno y modales */}
      <POSCajaTurnoBar
        turno={turnoAbierto}
        onIniciar={() => setModalTurno(true)}
        onTerminar={handleTerminarTurno}
      />
      <POSDialogIniciarTurno
        open={modalTurno}
        onClose={() => setModalTurno(false)}
        onSubmit={handleIniciarTurno}
        efectivoInicial={efectivoInicial}
        setEfectivoInicial={setEfectivoInicial}
      />
      <POSDialogResumenTurno
        open={resumenModal}
        onClose={() => setResumenModal(false)}
        resumen={resumenVentas}
        turno={turnoAbierto}
        userEmail={user?.email || ""}
        onConfirm={handleConfirmarCierre}
      />

      {/* Main POS */}
      <div className="flex flex-col lg:flex-row gap-6">
        <POSCategorySidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <main className="lg:w-3/5 w-full">
          <POSProductGrid products={filtered} loading={loading} addToCart={addToCart} formatPrice={formatPrice} />
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
                disabled={processingOrder || cart.length === 0 || !turnoAbierto}
                className="w-full text-lg font-semibold bg-[#C22320] hover:bg-[#a31916]"
                size="lg"
                onClick={() => setShowConfirmModal(true)}
              >
                {processingOrder ? "Procesando..." : "Registrar Venta"}
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="pos-confirm-desc">
              <DialogHeader>
                <DialogTitle>¿Confirmar venta?</DialogTitle>
                <DialogDescription id="pos-confirm-desc">
                  Revisa el total y el método de pago antes de confirmar.
                </DialogDescription>
              </DialogHeader>
              <p>Total a pagar: {formatPrice(getTotalFinal())}</p>
              {paymentMethod === "efectivo" && (
                <p>
                  Efectivo ingresado: {formatPrice(parseInt(efectivoIngresado) || 0)} — Vuelto:{" "}
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
