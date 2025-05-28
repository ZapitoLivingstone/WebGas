import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items, shipping_address, payment_method } = body

    // Calcular total
    const total = items.reduce((sum: number, item: any) => sum + item.precio * item.cantidad, 0)

    // Crear pedido
    const { data: order, error: orderError } = await supabase
      .from("pedidos")
      .insert({
        usuario_id: user.id,
        tipo_pago: payment_method,
        envio_direccion: shipping_address,
        total: total,
        estado: "pendiente",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Crear detalles del pedido
    const orderDetails = items.map((item: any) => ({
      pedido_id: order.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      tipo_producto: item.tipo,
    }))

    const { error: detailsError } = await supabase.from("detalle_pedido").insert(orderDetails)

    if (detailsError) throw detailsError

    // Crear notificaciones para productos dropshipping
    const dropshippingItems = items.filter((item: any) => item.tipo === "dropshipping")

    if (dropshippingItems.length > 0) {
      // Obtener distribuidores (simplificado - en producción sería más complejo)
      const { data: distributors } = await supabase.from("usuarios").select("id").eq("rol", "distribuidor").limit(1)

      if (distributors && distributors.length > 0) {
        const notifications = dropshippingItems.map((item: any) => ({
          pedido_id: order.id,
          producto_id: item.producto_id,
          distribuidor_id: distributors[0].id,
          estado: "pendiente",
        }))

        await supabase.from("notificaciones_distribuidor").insert(notifications)
      }
    }

    // Actualizar stock para productos propios
    for (const item of items.filter((i: any) => i.tipo === "propio")) {
      await supabase
        .from("productos")
        .update({
          stock: supabase.raw(`stock - ${item.cantidad}`),
        })
        .eq("id", item.producto_id)
    }

    // Limpiar carrito
    await supabase.from("carts").delete().eq("user_id", user.id)

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
