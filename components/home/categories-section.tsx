"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  id: number
  nombre: string
  product_count?: number
  icono?: string | null
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      // Obtener categorías con conteo de productos
      const { data, error } = await supabase
        .from("categorias")
        .select(`
          id,
          nombre,
          icono
        `)
        .order("nombre")

      if (error) throw error

      // Procesar datos para obtener el conteo
      const categoriesWithCount = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from("productos")
            .select("*", { count: "exact", head: true })
            .eq("categoria_id", category.id)
            .eq("activo", true)

          return {
            ...category,
            product_count: count || 0,
          }
        }),
      )

      setCategories(categoriesWithCount)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explora por Categorías</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que necesitas navegando por nuestras categorías especializadas
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explora por Categorías</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encuentra exactamente lo que necesitas navegando por nuestras categorías especializadas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?categoria=${category.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <div className="relative w-full h-32 flex-shrink-0 rounded-t-xl overflow-hidden bg-white">
                  <Image
                    src={
                      category.icono && category.icono.trim() !== ""
                        ? category.icono
                        : `/placeholder.svg?height=120&width=120&text=${encodeURIComponent(category.nombre)}`
                    }
                    alt={category.nombre}
                    fill // Esto hace que la imagen llene el contenedor usando absolute
                    className="object-cover object-center w-full h-full"
                    unoptimized // o quita si usas dominio permitido
                  />
                </div>
                <CardContent className="flex-1 flex flex-col items-center justify-center py-4">
                  <h3 className="font-semibold text-lg mb-2">{category.nombre}</h3>
                  <p className="text-gray-500 text-sm">{category.product_count || 0} productos</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
