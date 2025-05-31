"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { create } from "zustand"

interface CartItem {
  product_id: number
  quantity: number
  product: {
    id: number
    nombre: string
    precio: number
    imagen_url: string
    stock: number | null
    tipo: string
  }
}

// Store global para sincronización entre componentes
interface CartStore {
  count: number
  items: CartItem[]
  setCount: (count: number) => void
  setItems: (items: CartItem[]) => void
  updateTimestamp: number
  triggerUpdate: () => void
}

const useCartStore = create<CartStore>((set) => ({
  count: 0,
  items: [],
  setCount: (count) => set({ count }),
  setItems: (items) => set({ items }),
  updateTimestamp: Date.now(),
  triggerUpdate: () => set({ updateTimestamp: Date.now() }),
}))

export function useCart() {
  const [loading, setLoading] = useState(true)
  const { user, isConfigured } = useAuth()
  const { count, items, setCount, setItems, updateTimestamp, triggerUpdate } = useCartStore()

  const fetchCartItems = useCallback(async () => {
    if (!user || !supabase) {
      setItems([])
      setCount(0)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("carts")
        .select(`
          product_id,
          quantity,
          product:productos(
            id,
            nombre,
            precio,
            imagen_url,
            stock,
            tipo
          )
        `)
        .eq("user_id", user.id)

      if (error) throw error

      const fetchedItems = (data || []).map((item: any) => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product,
      }))
      const newCount = fetchedItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

      setItems(fetchedItems)
      setCount(newCount)

      console.log("Cart updated:", { items: fetchedItems.length, count: newCount })
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setLoading(false)
    }
  }, [user, setItems, setCount])

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    fetchCartItems()
  }, [user, isConfigured, fetchCartItems, updateTimestamp])

  const addToCart = async (productId: number, quantity = 1) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      // Actualizar optimísticamente
      setCount(count + quantity)

      // Verificar si el producto ya está en el carrito
      const { data: existingItem } = await supabase
        .from("carts")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      if (existingItem) {
        // Actualizar cantidad
        const { error } = await supabase
          .from("carts")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("user_id", user.id)
          .eq("product_id", productId)

        if (error) throw error
      } else {
        // Agregar nuevo item
        const { error } = await supabase.from("carts").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        })

        if (error) throw error
      }

      // Forzar actualización global
      triggerUpdate()
      await fetchCartItems()
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      const { error } = await supabase
        .from("carts")
        .update({ quantity })
        .eq("user_id", user.id)
        .eq("product_id", productId)

      if (error) throw error

      // Forzar actualización global
      triggerUpdate()
      await fetchCartItems()
    } catch (error) {
      console.error("Error updating quantity:", error)
      throw error
    }
  }

  const removeFromCart = async (productId: number) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      const { error } = await supabase.from("carts").delete().eq("user_id", user.id).eq("product_id", productId)

      if (error) throw error

      // Forzar actualización global
      triggerUpdate()
      await fetchCartItems()
    } catch (error) {
      console.error("Error removing from cart:", error)
      throw error
    }
  }

  const clearCart = async () => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      const { error } = await supabase.from("carts").delete().eq("user_id", user.id)

      if (error) throw error

      setItems([])
      setCount(0)
      triggerUpdate()
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      return total + item.product.precio * item.quantity
    }, 0)
  }

  return {
    cartItems: items,
    cartCount: count,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    fetchCartItems,
  }
}
