import { supabase } from "./supabase"
import type { Database } from "./database.types"

type Product = Database["public"]["Tables"]["productos"]["Row"]
type ProductInsert = Database["public"]["Tables"]["productos"]["Insert"]
type ProductUpdate = Database["public"]["Tables"]["productos"]["Update"]

export async function getProducts(filters?: {
  categoria_id?: number
  tipo?: "propio" | "dropshipping"
  activo?: boolean
  search?: string
}) {
  let query = supabase.from("productos").select(`
      *,
      categoria:categorias(id, nombre)
    `)

  if (filters?.categoria_id) {
    query = query.eq("categoria_id", filters.categoria_id)
  }

  if (filters?.tipo) {
    query = query.eq("tipo", filters.tipo)
  }

  if (filters?.activo !== undefined) {
    query = query.eq("activo", filters.activo)
  }

  if (filters?.search) {
    query = query.ilike("nombre", `%${filters.search}%`)
  }

  const { data, error } = await query.order("nombre")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

export async function getProduct(id: number) {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias(id, nombre)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

export async function createProduct(product: ProductInsert) {
  const { data, error } = await supabase.from("productos").insert(product).select().single()

  if (error) {
    console.error("Error creating product:", error)
    throw error
  }

  return data
}

export async function updateProduct(id: number, updates: ProductUpdate) {
  const { data, error } = await supabase.from("productos").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating product:", error)
    throw error
  }

  return data
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("productos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function updateProductStock(id: number, quantity: number) {
  const { data, error } = await supabase
    .from("productos")
    .update({
      stock: supabase.raw(`stock - ${quantity}`),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating product stock:", error)
    throw error
  }

  return data
}
