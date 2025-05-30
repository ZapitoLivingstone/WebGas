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
  console.log("Creating product with data:", product)

  // Obtener el usuario actual para asignar creado_por
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  // Agregar el campo creado_por
  const productWithCreator = {
    ...product,
    creado_por: user.id,
  }

  const { data, error } = await supabase.from("productos").insert(productWithCreator).select().single()

  if (error) {
    console.error("Error creating product:", error)
    throw error
  }

  return data
}

export async function updateProduct(id: number, updates: ProductUpdate) {
  try {
    console.log("=== UPDATE PRODUCT DEBUG ===")
    console.log("Product ID:", id)
    console.log("Updates object:", updates)

    // Validar que el ID sea válido
    if (!id || isNaN(id) || id <= 0) {
      throw new Error(`ID de producto inválido: ${id}`)
    }

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("Current user:", user?.id)

    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar que el producto existe
    const { data: existingProduct, error: fetchError } = await supabase
      .from("productos")
      .select("id, nombre")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching existing product:", fetchError)
      throw new Error(`No se pudo verificar el producto: ${fetchError.message}`)
    }

    if (!existingProduct) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    console.log("Existing product:", existingProduct)

    // Limpiar y validar datos - SOLO CAMPOS QUE EXISTEN EN LA TABLA productos
    const cleanUpdates: ProductUpdate = {}

    // Validar y limpiar cada campo que existe en la tabla
    if (updates.nombre !== undefined) {
      if (typeof updates.nombre !== "string" || updates.nombre.trim() === "") {
        throw new Error("El nombre del producto es requerido")
      }
      cleanUpdates.nombre = updates.nombre.trim()
    }

    if (updates.descripcion !== undefined) {
      cleanUpdates.descripcion = updates.descripcion === "" ? null : updates.descripcion
    }

    if (updates.precio !== undefined) {
      const precio = Number(updates.precio)
      if (isNaN(precio) || precio < 0) {
        throw new Error("El precio debe ser un número válido mayor o igual a 0")
      }
      cleanUpdates.precio = precio
    }

    if (updates.stock !== undefined) {
      if (updates.stock === null || (typeof updates.stock === "string" && updates.stock === "")) {
        cleanUpdates.stock = null
      } else {
        const stock = Number(updates.stock)
        if (isNaN(stock) || stock < 0) {
          throw new Error("El stock debe ser un número válido mayor o igual a 0")
        }
        cleanUpdates.stock = stock
      }
    }

    if (updates.categoria_id !== undefined) {
      const categoriaId = Number(updates.categoria_id)
      if (isNaN(categoriaId) || categoriaId <= 0) {
        throw new Error("Debe seleccionar una categoría válida")
      }
      cleanUpdates.categoria_id = categoriaId
    }

    if (updates.tipo !== undefined) {
      if (!["propio", "dropshipping"].includes(updates.tipo)) {
        throw new Error("Tipo de producto inválido")
      }
      cleanUpdates.tipo = updates.tipo
    }

    if (updates.activo !== undefined) {
      cleanUpdates.activo = Boolean(updates.activo)
    }

    if (updates.imagen_url !== undefined) {
      cleanUpdates.imagen_url = updates.imagen_url === "" ? null : updates.imagen_url
    }

    // No incluir creado_por en las actualizaciones (se mantiene el original)

    console.log("Clean updates (only valid fields):", cleanUpdates)

    // Realizar la actualización
    const { data, error } = await supabase.from("productos").update(cleanUpdates).eq("id", id).select().single()

    if (error) {
      console.error("=== SUPABASE ERROR ===")
      console.error("Error object:", error)
      console.error("Error message:", error.message)
      console.error("Error details:", error.details)
      console.error("Error hint:", error.hint)
      console.error("Error code:", error.code)

      // Crear un error más descriptivo
      let errorMessage = "Error desconocido al actualizar el producto"

      if (error.message) {
        errorMessage = error.message
      }

      if (error.code === "42501") {
        errorMessage = "No tienes permisos para actualizar este producto"
      } else if (error.code === "23505") {
        errorMessage = "Ya existe un producto con ese nombre"
      } else if (error.code === "23503") {
        errorMessage = "La categoría seleccionada no existe"
      } else if (error.code === "23514") {
        errorMessage = "Los datos no cumplen con las restricciones de la base de datos"
      }

      throw new Error(errorMessage)
    }

    console.log("Product updated successfully:", data)
    return data
  } catch (error: any) {
    console.error("=== CATCH ERROR ===")
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    console.error("Error message:", error?.message)
    console.error("Full error:", error)

    // Re-throw el error para que sea manejado por el componente
    throw error
  }
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("productos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function updateProductStock(id: number, quantity: number) {
  // First, fetch the current stock
  const { data: product, error: fetchError } = await supabase
    .from("productos")
    .select("stock")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching current stock:", fetchError)
    throw fetchError
  }

  const currentStock = product?.stock ?? 0
  const newStock = currentStock - quantity

  const { data, error } = await supabase
    .from("productos")
    .update({
      stock: newStock,
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
