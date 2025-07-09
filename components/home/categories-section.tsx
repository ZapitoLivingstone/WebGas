"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface Category {
  id: number
  nombre: string
  icono?: string | null
  total_comprados?: number
}

const TOP_CATEGORIES_COUNT = 4

export function CategoriesSection() {
  const [topCategories, setTopCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopCategories()
  }, [])

  async function fetchTopCategories() {
    setLoading(true)
    // ⚡ Consulta: suma la cantidad vendida por categoría
    // Ajusta los nombres de tablas/campos si tu estructura es distinta
    // Esto asume tabla 'detalle_pedido' y 'productos' vinculadas a 'categorias'
    const { data, error } = await supabase
      .rpc('top_categorias_mas_vendidas', { top_n: TOP_CATEGORIES_COUNT }) // Usa función SQL (recomendado)
    // Si no tienes la función RPC, puedes hacerlo con dos queries JS:
    // 1) Obtén sumatorias agrupadas, 2) Join a categorías, 3) Order by total desc, 4) Limit.

    if (error) {
      console.error("Error fetching top categories:", error)
      setLoading(false)
      return
    }
    setTopCategories(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Categorías más vendidas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre las categorías favoritas de nuestros clientes
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(TOP_CATEGORIES_COUNT)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl shadow-md bg-white h-60 flex flex-col items-center justify-end animate-pulse overflow-hidden"
              >
                <div className="w-full h-3/4 bg-gray-200" />
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
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Categorías más vendidas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre las categorías favoritas de nuestros clientes
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {topCategories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -6, scale: 1.035 }}
              className="h-full"
            >
              <Link
                href={`/products?categoria=${category.id}`}
                className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded-2xl"
                tabIndex={0}
                aria-label={`Ver productos de la categoría ${category.nombre}`}
              >
                <Card
                  className={`
                    relative rounded-2xl shadow-md bg-white border-none
                    overflow-hidden cursor-pointer h-60 flex items-end group
                    transition-all duration-300 hover:shadow-xl
                  `}
                >
                  <div className="absolute inset-0 w-full h-full">
                    <Image
                      src={
                        category.icono && category.icono.trim() !== ""
                          ? category.icono
                          : `/placeholder.svg?height=320&width=320&text=${encodeURIComponent(category.nombre)}`
                      }
                      alt={category.nombre}
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                      priority={idx < 2}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/90 via-white/60 to-transparent z-10"></div>
                  </div>
                  <span
                    className={`
                      relative z-20 w-full text-center pb-3
                      text-lg font-semibold text-gray-900 tracking-tight
                      drop-shadow-sm select-none
                    `}
                    style={{
                      textShadow: "0 2px 6px rgba(255,255,255,0.9)"
                    }}
                  >
                    {category.nombre}
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Botón Mostrar más */}
        <div className="text-center">
          <Link href="/categories" passHref>
            <Button
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-base shadow-md hover:bg-blue-700 transition-colors duration-200"
              aria-label="Ver todas las categorías"
            >
              Ver más categorías
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
