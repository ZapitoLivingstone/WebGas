import { supabase } from "./supabase"

export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from("carts")
    .select(`
      *,
      product:productos(
        id,
        nombre,
        precio,
        imagen_url,
        stock,
        tipo
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching cart items:", error)
    return []
  }

  return data || []
}

export async function addToCart(userId: string, productId: number, quantity = 1) {
  // Verificar si el producto ya está en el carrito
  const { data: existingItem } = await supabase
    .from("carts")
    .select("quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single()

  if (existingItem) {
    // Actualizar cantidad
    const { error } = await supabase
      .from("carts")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("user_id", userId)
      .eq("product_id", productId)

    if (error) throw error
  } else {
    // Agregar nuevo item
    const { error } = await supabase.from("carts").insert({
      user_id: userId,
      product_id: productId,
      quantity,
    })

    if (error) throw error
  }
}

export async function updateCartItemQuantity(userId: string, productId: number, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(userId, productId)
  }

  const { error } = await supabase.from("carts").update({ quantity }).eq("user_id", userId).eq("product_id", productId)

  if (error) throw error
}

export async function removeFromCart(userId: string, productId: number) {
  const { error } = await supabase.from("carts").delete().eq("user_id", userId).eq("product_id", productId)

  if (error) throw error
}

export async function clearCart(userId: string) {
  const { error } = await supabase.from("carts").delete().eq("user_id", userId)

  if (error) throw error
}
