"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductFilters } from "@/components/products/ProductFilters"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductPagination } from "@/components/products/ProductPagination"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

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

const PRODUCTS_PER_PAGE = 12

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState("nombre")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
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
    function normalizeString(str: string) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    }
    const search = normalizeString(searchTerm)
    const filtered = products.filter((product) => {
      const nombre = normalizeString(product.nombre)
      const categoria = normalizeString(product.categoria?.nombre || "")
      return nombre.includes(search) || categoria.includes(search)
    })
    setFilteredProducts(filtered)
    setCurrentPage(1) // Cambia de página si cambian los filtros/búsqueda
  }, [products, searchTerm])

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

  // PAGINACIÓN
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE
  const pageProducts = filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE)

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
            <ProductFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
              handleSearch={handleSearch}
            />
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
                  <p className="text-gray-600">{filteredProducts.length} productos encontrados</p>
                </div>
                <ProductGrid products={pageProducts} />
                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
