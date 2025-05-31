"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { create } from "zustand"

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

// Store global para sincronización entre componentes
interface WishlistStore {
  count: number
  items: WishlistItem[]
  setCount: (count: number) => void
  setItems: (items: WishlistItem[]) => void
  updateTimestamp: number
  triggerUpdate: () => void
}

const useWishlistStore = create<WishlistStore>((set) => ({
  count: 0,
  items: [],
  setCount: (count) => set({ count }),
  setItems: (items) => set({ items }),
  updateTimestamp: Date.now(),
  triggerUpdate: () => set({ updateTimestamp: Date.now() }),
}))

export function useWishlist() {
  const [loading, setLoading] = useState(true)
  const { user, isConfigured } = useAuth()
  const { count, items, setCount, setItems, updateTimestamp, triggerUpdate } = useWishlistStore()

  const fetchWishlistItems = useCallback(async () => {
    if (!user || !supabase) {
      setItems([])
      setCount(0)
      setLoading(false)
      return
    }

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

      const fetchedItems = (data || []).map((item: any) => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product,
      }))
      const newCount = fetchedItems.length

      setItems(fetchedItems)
      setCount(newCount)

      console.log("Wishlist updated:", { items: fetchedItems.length, count: newCount })
    } catch (error) {
      console.error("Error fetching wishlist items:", error)
    } finally {
      setLoading(false)
    }
  }, [user, setItems, setCount])

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    fetchWishlistItems()
  }, [user, isConfigured, fetchWishlistItems, updateTimestamp])

  const addToWishlist = async (productId: number) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      // Actualizar optimísticamente
      setCount(count + 1)

      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (error) throw error

      // Forzar actualización global
      triggerUpdate()
      await fetchWishlistItems()
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
  }

  const removeFromWishlist = async (productId: number) => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not configured")

    try {
      // Actualizar optimísticamente
      setCount(count - 1)

      const { error } = await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId)

      if (error) throw error

      // Forzar actualización global
      triggerUpdate()
      await fetchWishlistItems()
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
  }

  const isInWishlist = (productId: number) => {
    return items.some((item) => item.product_id === productId)
  }

  return {
    wishlistItems: items,
    wishlistCount: count,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlistItems,
  }
}
