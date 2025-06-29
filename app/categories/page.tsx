"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import {Footer} from "@/components/layout/footer"
import { supabase } from "@/lib/supabase"

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

      // Mapear el conteo de productos para cada categoría
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
    <div className="container mx-auto px-4 py-8">
      <Header />
      <h1 className="text-3xl font-bold mb-6" style={
        {
          marginTop: "1rem", 
        }
      }>Categorías</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando categorías...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?categoria=${category.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <div className="relative w-full h-32 rounded-t-xl overflow-hidden bg-white">
                  <Image
                    src={
                      category.icono && category.icono.trim() !== ""
                        ? category.icono
                        : `/placeholder.svg?height=120&width=120&text=${encodeURIComponent(category.nombre)}`
                    }
                    alt={category.nombre}
                    fill
                    className="object-cover object-center w-full h-full"
                    unoptimized
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{category.nombre}</CardTitle>
                    <Badge variant="secondary">{category.productCount} productos</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{category.descripcion || ""}</p>
                </CardContent>
              </Card>

            </Link>

          ))}
        </div>
      )}
    </div>
    
  )
}
