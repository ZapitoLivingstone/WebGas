"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Product {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen_url: string
  tipo: "propio" | "dropshipping"
  stock: number | null
  activo: boolean
  categoria_id: number
}

const PRODUCT_LIMIT = 8

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true)
        .order("id", { ascending: false })
        .limit(PRODUCT_LIMIT)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mejor skeleton visual
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Productos Destacados</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los productos más populares y mejor valorados por nuestros clientes
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl shadow-md bg-white h-80 flex flex-col items-center justify-end animate-pulse overflow-hidden">
                <div className="w-full h-2/3 bg-gray-200 rounded-t-2xl" />
                <div className="h-4 w-24 my-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Productos Destacados</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Los productos más populares y mejor valorados por nuestros clientes
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No hay productos disponibles</p>
            <Button asChild>
              <Link href="/admin">Ir al Panel de Administración</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 py-3 bg-[#C22320] text-white font-semibold text-base shadow-md hover:bg-[#a31916] transition-colors duration-200"
              >
                <Link href="/products">Explorar todos los productos</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
