"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/components/providers/auth-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

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
  categoria?: {
    id: number
    nombre: string
  }
}

interface Category {
  id: number
  nombre: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState("nombre")
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    const category = searchParams.get("categoria")
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, sortBy])

  const fetchCategories = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("categorias").select("*").order("nombre")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async () => {
    if (!supabase) return

    setLoading(true)
    try {
      let query = supabase
        .from("productos")
        .select(`
          *,
          categoria:categorias(id, nombre)
        `)
        .eq("activo", true)

      // Filtro por búsqueda
      if (searchTerm) {
        query = query.ilike("nombre", `%${searchTerm}%`)
      }

      // Filtro por categoría
      if (selectedCategory !== "all") {
        query = query.eq("categoria_id", Number.parseInt(selectedCategory))
      }

      // Ordenamiento
      const ascending = sortBy !== "precio_desc"
      const orderField = sortBy === "precio_desc" || sortBy === "precio_asc" ? "precio" : sortBy
      query = query.order(orderField, { ascending })

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Productos</h1>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="space-y-6">
              {/* Búsqueda */}
              <div>
                <h3 className="font-semibold mb-3">Buscar</h3>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Categorías */}
              <div>
                <h3 className="font-semibold mb-3">Categorías</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenamiento */}
              <div>
                <h3 className="font-semibold mb-3">Ordenar por</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nombre">Nombre A-Z</SelectItem>
                    <SelectItem value="precio_asc">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="precio_desc">Precio: Mayor a Menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">{products.length} productos encontrados</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
