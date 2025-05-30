import { supabase } from "./supabase"
import type { Database } from "./database.types"

type Category = Database["public"]["Tables"]["categorias"]["Row"]
type CategoryInsert = Database["public"]["Tables"]["categorias"]["Insert"]
type CategoryUpdate = Database["public"]["Tables"]["categorias"]["Update"]

export async function getCategories() {
  const { data, error } = await supabase.from("categorias").select("*").order("nombre")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export async function getCategory(id: number) {
  const { data, error } = await supabase.from("categorias").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching category:", error)
    return null
  }

  return data
}

export async function createCategory(category: CategoryInsert) {
  const { data, error } = await supabase.from("categorias").insert(category).select().single()

  if (error) {
    console.error("Error creating category:", error)
    throw error
  }

  return data
}

export async function updateCategory(id: number, updates: CategoryUpdate) {
  const { data, error } = await supabase.from("categorias").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating category:", error)
    throw error
  }

  return data
}

export async function deleteCategory(id: number) {
  // Primero verificamos si hay productos asociados a esta categoría
  const { count, error: countError } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", id)

  if (countError) {
    console.error("Error checking category products:", countError)
    throw countError
  }

  // Si hay productos, no permitimos eliminar la categoría
  if (count && count > 0) {
    throw new Error(`No se puede eliminar la categoría porque tiene ${count} productos asociados`)
  }

  // Si no hay productos, procedemos a eliminar
  const { error } = await supabase.from("categorias").delete().eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    throw error
  }

  return true
}

export async function getCategoryProductCount(id: number) {
  const { count, error } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", id)

  if (error) {
    console.error("Error counting category products:", error)
    return 0
  }

  return count || 0
}
