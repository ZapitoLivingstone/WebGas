import { supabase } from "./supabase"
import type { Database } from "./database.types"

type Order = Database["public"]["Tables"]["pedidos"]["Row"]
type OrderInsert = Database["public"]["Tables"]["pedidos"]["Insert"]
type OrderDetail = Database["public"]["Tables"]["detalle_pedido"]["Row"]
type OrderDetailInsert = Database["public"]["Tables"]["detalle_pedido"]["Insert"]

export interface CreateOrderData {
  items: {
    producto_id: number
    cantidad: number
    precio: number
    tipo: "propio" | "dropshipping"
  }[]
  shipping_address: string
  payment_method: string
}

export async function createOrder(userId: string, orderData: CreateOrderData) {
  const { items, shipping_address, payment_method } = orderData

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  // Crear pedido
  const { data: order, error: orderError } = await supabase
    .from("pedidos")
    .insert({
      usuario_id: userId,
      tipo_pago: payment_method,
      envio_direccion: shipping_address,
      total: total,
      estado: "pendiente",
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Crear detalles del pedido
  const orderDetails: OrderDetailInsert[] = items.map((item) => ({
    pedido_id: order.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    tipo_producto: item.tipo,
  }))

  const { error: detailsError } = await supabase.from("detalle_pedido").insert(orderDetails)

  if (detailsError) throw detailsError

  // Crear notificaciones para productos dropshipping
  const dropshippingItems = items.filter((item) => item.tipo === "dropshipping")

  if (dropshippingItems.length > 0) {
    // Obtener distribuidores
    const { data: distributors } = await supabase.from("usuarios").select("id").eq("rol", "distribuidor").limit(1)

    if (distributors && distributors.length > 0) {
      const notifications = dropshippingItems.map((item) => ({
        pedido_id: order.id,
        producto_id: item.producto_id,
        distribuidor_id: distributors[0].id,
        estado: "pendiente",
      }))

      await supabase.from("notificaciones_distribuidor").insert(notifications)
    }
  }

  // Actualizar stock para productos propios
  for (const item of items.filter((i) => i.tipo === "propio")) {
    await supabase
      .from("productos")
      .update({
        stock: supabase.raw(`stock - ${item.cantidad}`),
      })
      .eq("id", item.producto_id)
  }

  return order
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(`
      *,
      detalle_pedido(
        *,
        producto:productos(nombre, imagen_url)
      )
    `)
    .eq("usuario_id", userId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching user orders:", error)
    return []
  }

  return data || []
}

export async function getOrder(orderId: number) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(`
      *,
      usuario:usuarios(nombre, email),
      detalle_pedido(
        *,
        producto:productos(nombre, imagen_url, precio)
      )
    `)
    .eq("id", orderId)
    .single()

  if (error) {
    console.error("Error fetching order:", error)
    return null
  }

  return data
}

export async function updateOrderStatus(orderId: number, status: string) {
  const { data, error } = await supabase.from("pedidos").update({ estado: status }).eq("id", orderId).select().single()

  if (error) {
    console.error("Error updating order status:", error)
    throw error
  }

  return data
}
