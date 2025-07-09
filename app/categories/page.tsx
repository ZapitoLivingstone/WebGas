"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

interface Categoria {
  icono?: string | null
  id: number
  nombre: string
  descripcion?: string
  productCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      // Consulta todas las categorías con el conteo de productos por categoría
      const { data, error } = await supabase
        .from("categorias")
        .select(`
          id,
          nombre,
          icono,
          descripcion,
          productos:productos(count)
        `)
        .order("nombre")

      if (error) {
        setLoading(false)
        return
      }

      const withCount = (data || []).map((cat: any) => ({
        id: cat.id,
        nombre: cat.nombre,
        productCount: cat.productos?.length > 0 ? cat.productos[0].count : 0,
        icono: cat.icono || null,
        descripcion: cat.descripcion || "",
      }))
      setCategories(withCount)
      setLoading(false)
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-4xl font-bold mb-10 text-center tracking-tight">Categorías</h1>

        {loading ? (
          <div className="text-center py-24 text-gray-400 text-xl">Cargando categorías...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ scale: 1.04, y: -6 }}
                className="h-full"
              >
                <Link
                  href={`/products?categoria=${category.id}`}
                  className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded-2xl h-full"
                  tabIndex={0}
                  aria-label={`Ver productos de la categoría ${category.nombre}`}
                >
                  <Card
                    className={`
                      relative rounded-2xl shadow-lg bg-white border-none
                      overflow-hidden cursor-pointer h-80 flex flex-col items-end group
                      transition-all duration-300 hover:shadow-xl
                    `}
                  >
                    {/* Imagen fondo protagonista */}
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
                        priority={idx < 4}
                      />
                      {/* Degradado para legibilidad de texto */}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/90 via-white/60 to-transparent z-10"></div>
                    </div>
                    {/* Contenido sobre imagen */}
                    <div className="relative z-20 w-full text-center px-4 pb-5">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight mb-1"
                        style={{ textShadow: "0 2px 8px #fff" }}
                      >
                        {category.nombre}
                      </h2>
                      {category.descripcion && (
                        <p className="text-gray-600 text-sm max-w-xs mx-auto line-clamp-2"
                           style={{ textShadow: "0 2px 8px #fff" }}
                        >
                          {category.descripcion}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
