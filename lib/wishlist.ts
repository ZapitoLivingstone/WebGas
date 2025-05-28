import { supabase } from "./supabase"

export async function getWishlistItems(userId: string) {
  const { data, error } = await supabase
    .from("wishlist")
    .select(`
      *,
      product:productos(
        id,
        nombre,
        precio,
        imagen_url,
        descripcion,
        stock,
        tipo
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching wishlist items:", error)
    return []
  }

  return data || []
}

export async function addToWishlist(userId: string, productId: number) {
  const { error } = await supabase.from("wishlist").insert({
    user_id: userId,
    product_id: productId,
  })

  if (error) throw error
}

export async function removeFromWishlist(userId: string, productId: number) {
  const { error } = await supabase.from("wishlist").delete().eq("user_id", userId).eq("product_id", productId)

  if (error) throw error
}

export async function isInWishlist(userId: string, productId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single()

  if (error) return false
  return !!data
}
