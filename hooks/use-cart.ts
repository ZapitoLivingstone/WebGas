"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/components/providers/auth-provider"
import { useAuth } from "@/components/providers/auth-provider"

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

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user, isConfigured } = useAuth()

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    if (user) {
      fetchCartItems()
    } else {
      setCartItems([])
      setCartCount(0)
      setLoading(false)
    }
  }, [user, isConfigured])

  const fetchCartItems = async () => {
    if (!user || !supabase) return

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

      setCartItems(data || [])
      setCartCount(data?.reduce((sum, item) => sum + item.quantity, 0) || 0)
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: number, quantity = 1) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
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

      setCartItems([])
      setCartCount(0)
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.product.precio * item.quantity
    }, 0)
  }

  return {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    fetchCartItems,
  }
}
