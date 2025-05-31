"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { getProduct, updateProduct } from "@/lib/products"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Loader2, Save } from "lucide-react"
import { uploadImageToService } from "@/lib/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Category {
  id: number
  nombre: string
}

interface Product {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  stock: number | null
  categoria_id: number | null
  tipo: "propio" | "dropshipping"
  activo: boolean
  imagen_url: string | null
  creado_por: string | null
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const productId = Number.parseInt(params.id)

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria_id: 0,
    tipo: "propio",
    activo: true,
    imagen_url: "",
  })

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/")
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchCategories()
      fetchProduct()
    }
  }, [user, userRole, productId])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("categorias").select("id, nombre").order("nombre")
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      const product = await getProduct(productId)

      if (!product) {
        toast({
          title: "Error",
          description: "Producto no encontrado",
          variant: "destructive",
        })
        router.push("/admin/products")
        return
      }

      setFormData({
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio || 0,
        stock: product.stock || 0,
        categoria_id: product.categoria_id || 0,
        tipo: product.tipo || "propio",
        activo: product.activo ?? true,
        imagen_url: product.imagen_url || "",
      })

      if (product.imagen_url) {
        setImagePreview(product.imagen_url)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateImageUrl = (productName: string, index = 0) => {
    const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    const seed = cleanName + index

    const services = [
      `https://picsum.photos/seed/${seed}/400/400`,
      `https://source.unsplash.com/400x400/?product,${cleanName}`,
      `https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=${encodeURIComponent(productName)}`,
      `https://dummyimage.com/400x400/4F46E5/FFFFFF&text=${encodeURIComponent(productName)}`,
    ]

    return services[index % services.length]
  }

  const handleImageGenerate = () => {
    if (!formData.nombre?.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el nombre del producto primero",
        variant: "destructive",
      })
      return
    }

    const newImageUrl = generateImageUrl(formData.nombre)
    setFormData((prev) => ({ ...prev, imagen_url: newImageUrl }))
    setImagePreview(newImageUrl)

    toast({
      title: "Imagen generada",
      description: "URL de imagen generada automáticamente",
    })
  }

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imagen_url: url }))
    setImagePreview(url)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "El archivo debe ser una imagen",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe superar los 2MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const localPreview = URL.createObjectURL(file)
      setImagePreview(localPreview)

      const imageUrl = await uploadImageToService(file)

      if (imageUrl) {
        setFormData((prev) => ({ ...prev, imagen_url: imageUrl }))
        toast({
          title: "Imagen subida",
          description: "La imagen se ha subido correctamente",
        })
      } else {
        throw new Error("No se pudo obtener la URL de la imagen")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      })
      setImagePreview(formData.imagen_url || "")
    } finally {
      setIsUploading(false)
    }
  }

  const handleToggleActive = () => {
    if (formData.activo) {
      setShowDeactivateDialog(true)
    } else {
      setFormData((prev) => ({ ...prev, activo: true }))
    }
  }

  const confirmDeactivate = () => {
    setFormData((prev) => ({ ...prev, activo: false }))
    setShowDeactivateDialog(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== FORM SUBMIT DEBUG ===")
    console.log("Form data:", formData)
    console.log("Product ID:", productId)

    if (!formData.nombre?.trim() || !formData.precio || !formData.categoria_id) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar datos SOLO con campos que existen en la tabla
      const productData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || null,
        precio: Number(formData.precio),
        stock: formData.tipo === "propio" ? Number(formData.stock) : null,
        categoria_id: Number(formData.categoria_id),
        tipo: formData.tipo as "propio" | "dropshipping",
        activo: Boolean(formData.activo),
        imagen_url: formData.imagen_url?.trim() || null,
      }

      console.log("Submitting product data (only valid fields):", productData)

      const result = await updateProduct(productId, productData)
      console.log("Update result:", result)

      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado exitosamente",
      })

      router.push("/admin/products")
    } catch (error: any) {
      console.error("=== FORM ERROR HANDLER ===")
      console.error("Full error object:", error)

      let errorMessage = "No se pudo actualizar el producto"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Volver
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
              <CardDescription>Edita los datos del producto</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>

                {/* Precio y stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio *</Label>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, precio: Number.parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">
                      Stock {formData.tipo === "propio" ? "*" : "(No aplica para dropshipping)"}
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, stock: Number.parseInt(e.target.value) || 0 }))
                      }
                      placeholder="0"
                      disabled={formData.tipo === "dropshipping"}
                      required={formData.tipo === "propio"}
                    />
                    {formData.tipo === "dropshipping" && (
                      <p className="text-sm text-muted-foreground">Stock no aplica para productos dropshipping</p>
                    )}
                  </div>
                </div>

                {/* Categoría y tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria_id?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, categoria_id: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Producto *</Label>
                    <Select
                      value={formData.tipo || "propio"}
                      onValueChange={(value: "propio" | "dropshipping") =>
                        setFormData((prev) => ({ ...prev, tipo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="propio">Propio (con stock)</SelectItem>
                        <SelectItem value="dropshipping">Dropshipping (sin stock)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Imagen */}
                <div className="space-y-4">
                  <Label>Imagen del Producto</Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Subir imagen */}
                    <div className="space-y-2">
                      <Label htmlFor="image-upload" className="block">
                        Subir imagen
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="flex-1"
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    </div>

                    {/* URL de imagen */}
                    <div className="space-y-2">
                      <Label htmlFor="image-url">URL de imagen</Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-url"
                          value={formData.imagen_url || ""}
                          onChange={(e) => handleImageUrlChange(e.target.value)}
                          placeholder="URL de la imagen"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleImageGenerate}
                          disabled={!formData.nombre?.trim() || isUploading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Generar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImagePreview("")
                          setFormData((prev) => ({ ...prev, imagen_url: "" }))
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => {
                          setImagePreview("")
                          setFormData((prev) => ({ ...prev, imagen_url: "" }))
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Estado activo */}
                <div className="flex items-center space-x-2">
                  <Switch id="activo" checked={formData.activo} onCheckedChange={handleToggleActive} />
                  <Label htmlFor="activo">
                    Producto {formData.activo ? "activo" : "inactivo"} (visible en la tienda)
                  </Label>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Modal de confirmación para desactivar producto */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar este producto? No estará visible para los clientes en la tienda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
