"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/components/providers/auth-provider"
import { useAuth } from "@/components/providers/auth-provider"

interface WishlistItem {
  product_id: number
  product: {
    id: number
    nombre: string
    precio: number
    imagen_url: string
    descripcion: string
    stock: number | null
    tipo: string
  }
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user, isConfigured } = useAuth()

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    if (user) {
      fetchWishlistItems()
    } else {
      setWishlistItems([])
      setWishlistCount(0)
      setLoading(false)
    }
  }, [user, isConfigured])

  const fetchWishlistItems = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          product_id,
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
        .eq("user_id", user.id)

      if (error) throw error

      setWishlistItems(data || [])
      setWishlistCount(data?.length || 0)
    } catch (error) {
      console.error("Error fetching wishlist items:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId: number) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (error) throw error

      await fetchWishlistItems()
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
  }

  const removeFromWishlist = async (productId: number) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      const { error } = await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId)

      if (error) throw error

      await fetchWishlistItems()
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.product_id === productId)
  }

  return {
    wishlistItems,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlistItems,
  }
}
