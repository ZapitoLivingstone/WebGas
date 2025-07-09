"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProductCount,
} from "@/lib/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { IconUploader } from "@/components/category/IconUploader" // <= INCORPORA TU COMPONENTE AQUÍ

interface Category {
  id: number
  nombre: string
  descripcion: string | null
  icono: string | null
}

export default function CategoriesPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [productCounts, setProductCounts] = useState<Record<number, number>>({})
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    icono: "",
  })

  // --- EFECTOS ---

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/")
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    if (user && userRole === "admin") {
      loadCategories()
    }
  }, [user, userRole])

  useEffect(() => {
    function normalizeString(str: string) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    }
    if (categories.length > 0) {
      if (searchQuery.trim() === "") {
        setFilteredCategories(categories)
      } else {
        const search = normalizeString(searchQuery)
        const filtered = categories.filter((category) =>
          normalizeString(category.nombre).includes(search)
        )
        setFilteredCategories(filtered)
      }
    }
  }, [categories, searchQuery])

  // --- CRUD ---

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const data = await getCategories()
      setCategories(data)
      setFilteredCategories(data)
      const counts: Record<number, number> = {}
      for (const category of data) {
        counts[category.id] = await getCategoryProductCount(category.id)
      }
      setProductCounts(counts)
    } catch (error) {
      console.error("Error loading categories:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // --- HANDLERS FORM ---

  const handleAddCategory = () => {
    setFormData({ nombre: "", descripcion: "", icono: "" })
    setShowAddDialog(true)
  }

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category)
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || "",
      icono: category.icono || "",
    })
    setShowEditDialog(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setCurrentCategory(category)
    setShowDeleteDialog(true)
  }

  const submitAddCategory = async () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es obligatorio",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      const newCategory = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        icono: formData.icono.trim() || null,
      }
      await createCategory(newCategory)
      setShowAddDialog(false)
      toast({ title: "Categoría creada", description: "La categoría se ha creado exitosamente" })
      loadCategories()
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Categoría duplicada",
          description: "Ya existe una categoría con ese nombre.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear la categoría",
          variant: "destructive",
        })
      }
      console.error("Error creating category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitEditCategory = async () => {
    if (!currentCategory) return
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es obligatorio",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      const updatedCategory = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        icono: formData.icono.trim() || null,
      }
      await updateCategory(currentCategory.id, updatedCategory)
      setShowEditDialog(false)
      toast({ title: "Categoría actualizada", description: "La categoría se ha actualizado exitosamente" })
      loadCategories()
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitDeleteCategory = async () => {
    if (!currentCategory) return
    setIsSubmitting(true)
    try {
      await deleteCategory(currentCategory.id)
      setShowDeleteDialog(false)
      toast({ title: "Categoría eliminada", description: "La categoría se ha eliminado exitosamente" })
      loadCategories()
    } catch (error: any) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user || userRole !== "admin") {
    return null
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Categorías</h1>
            <Button onClick={handleAddCategory} size="sm" className="w-full sm:w-auto flex items-center gap-2">
              <Plus className="h-5 w-5" /> Nueva Categoría
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>Administra las categorías de productos de tu tienda</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar categorías..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-9 w-9 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Limpiar</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No se encontraron categorías con ese nombre" : "No hay categorías creadas"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Icono</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.nombre}</TableCell>
                        <TableCell>{category.descripcion || "-"}</TableCell>
                        <TableCell>
                          {category.icono ? (
                            <img src={category.icono} alt="icono" className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{productCounts[category.id] || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                              disabled={productCounts[category.id] > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">Total: {filteredCategories.length} categorías</div>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* --- MODAL AGREGAR --- */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Categoría</DialogTitle>
            <DialogDescription>Crea una nueva categoría para tus productos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre de la categoría"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción de la categoría"
                rows={3}
                className="resize-none"
              />
            </div>
            <IconUploader
              iconUrl={formData.icono}
              setIconUrl={url => setFormData(prev => ({ ...prev, icono: url }))}
              label="Icono de la categoría (opcional)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={submitAddCategory} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Categoría"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL EDITAR --- */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>Modifica los detalles de la categoría</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre de la categoría"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción de la categoría"
                rows={3}
                className="resize-none"
              />
            </div>
            <IconUploader
              iconUrl={formData.icono}
              setIconUrl={url => setFormData(prev => ({ ...prev, icono: url }))}
              label="Icono de la categoría (opcional)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={submitEditCategory} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL ELIMINAR --- */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría "{currentCategory?.nombre}"?
              {productCounts[currentCategory?.id || 0] > 0 && (
                <div className="mt-2 text-red-500">
                  Esta categoría tiene {productCounts[currentCategory?.id || 0]} productos asociados y no puede ser eliminada. Debes reasignar o eliminar los productos primero.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={submitDeleteCategory}
              disabled={isSubmitting || productCounts[currentCategory?.id || 0] > 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
