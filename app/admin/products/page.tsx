"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { getProducts, deleteProduct, updateProduct } from "@/lib/products"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Eye, Power } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Product {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  activo: boolean
  tipo: "propio" | "dropshipping"
  imagen_url: string
  categoria: {
    nombre: string
  }
}

export default function ProductsPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(6)
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  // Estados para modales
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/")
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchProducts()
    }
  }, [user, userRole])

  // Actualiza el filtro y paginación según búsqueda y categoría
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
      const categoria = normalizeString(product.categoria.nombre)
      const matchSearch = nombre.includes(search) || categoria.includes(search)
      const matchCategory = selectedCategory === "Todas" || categoria === normalizeString(selectedCategory)
      return matchSearch && matchCategory
    })
    setFilteredProducts(filtered)
    setCurrentPage(1) // Reinicia la página cuando se filtra
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Saca las categorías únicas
  const categories = Array.from(new Set(products.map(p => p.categoria.nombre))).sort()

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatusClick = (product: Product) => {
    setSelectedProduct(product)
    setToggleStatusDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      await deleteProduct(selectedProduct.id)
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id))
      toast({
        title: "Producto eliminado",
        description: `${selectedProduct.nombre} ha sido eliminado exitosamente`,
      })
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedProduct) return

    try {
      const updatedProduct = await updateProduct(selectedProduct.id, {
        activo: !selectedProduct.activo,
      })

      setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? { ...p, activo: !p.activo } : p)))

      toast({
        title: updatedProduct.activo ? "Producto activado" : "Producto desactivado",
        description: `${selectedProduct.nombre} ha sido ${updatedProduct.activo ? "activado" : "desactivado"} exitosamente`,
      })

      setToggleStatusDialogOpen(false)
    } catch (error) {
      console.error("Error updating product status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del producto",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || userRole !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Productos</h1>
          <Button
            onClick={() => router.push("/admin/products/new")}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {/* Búsqueda */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtro de categorías */}
        <div
          className="
            mb-6 
            flex 
            flex-nowrap 
            overflow-x-auto 
            no-scrollbar 
            gap-2 
            py-1
            -mx-2 px-2
            sm:overflow-x-visible
            sm:flex-wrap
            sm:gap-3
          "
        >
          <Button
            variant={selectedCategory === "Todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("Todas")}
            className="flex-shrink-0"
          >
            Todas
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="flex-shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>


        {/* Lista de productos paginada */}
        <div
          className="
            grid
            gap-4
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-3
          "
        >
          {paginatedProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">
                  {searchTerm || selectedCategory !== "Todas"
                    ? "No se encontraron productos"
                    : "No hay productos registrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedProducts.map((product) => (
              <Card
                key={product.id}
                className={`flex flex-col h-full justify-between ${!product.activo ? "opacity-75" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Imagen */}
                    <div className="w-full md:w-16 h-32 md:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                      {product.imagen_url ? (
                        <img
                          src={product.imagen_url || "/placeholder.svg"}
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=${encodeURIComponent(product.nombre.charAt(0))}`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {product.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{product.nombre}</h3>
                          <p className="text-lg font-bold text-blue-600 mt-1 sm:mt-0">{formatPrice(product.precio)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 break-words">{product.categoria.nombre}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={product.activo ? "default" : "secondary"}>
                            {product.activo ? "Activo" : "Inactivo"}
                          </Badge>
                          <Badge variant="outline">{product.tipo === "propio" ? "Propio" : "Dropshipping"}</Badge>
                          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-end items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatusClick(product)}
                      className="w-full sm:w-auto"
                    >
                      <Power className={`h-4 w-4 ${product.activo ? "text-green-500" : "text-gray-500"}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium">Página {currentPage} de {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}

      </main>
      <Footer />

      {/* Modal de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El producto "{selectedProduct?.nombre}" será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para activar/desactivar */}
      <Dialog open={toggleStatusDialogOpen} onOpenChange={setToggleStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.activo ? "Desactivar producto" : "Activar producto"}</DialogTitle>
            <DialogDescription>
              {selectedProduct?.activo
                ? `El producto "${selectedProduct?.nombre}" no estará visible para los clientes en la tienda.`
                : `El producto "${selectedProduct?.nombre}" será visible para los clientes en la tienda.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant={selectedProduct?.activo ? "destructive" : "default"} onClick={handleToggleStatus}>
              {selectedProduct?.activo ? "Desactivar" : "Activar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
