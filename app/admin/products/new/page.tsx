"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { createProduct } from "@/lib/products"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Loader2, Save } from "lucide-react"
import { uploadImageToService } from "@/lib/image-upload"

interface Category {
  id: number
  nombre: string
}

export default function NewProductPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria_id: 0,
    tipo: "propio" as "propio" | "dropshipping",
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
    }
  }, [user, userRole])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("categorias").select("id, nombre").order("nombre")
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== CREATE PRODUCT DEBUG ===")
    console.log("Form data:", formData)

    if (!formData.nombre?.trim() || !formData.precio || !formData.categoria_id) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validar stock para productos propios
    if (formData.tipo === "propio" && (!formData.stock || formData.stock < 0)) {
      toast({
        title: "Error",
        description: "Los productos propios requieren stock válido",
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

      console.log("Submitting product data:", productData)

      const result = await createProduct(productData)
      console.log("Create result:", result)

      toast({
        title: "Producto creado",
        description: "El producto se ha creado exitosamente",
      })

      router.push("/admin/products")
    } catch (error: any) {
      console.error("=== CREATE ERROR ===")
      console.error("Full error object:", error)

      let errorMessage = "No se pudo crear el producto"

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

  if (loading) {
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
            <h1 className="text-3xl font-bold">Nuevo Producto</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Volver
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
              <CardDescription>Completa los datos del nuevo producto</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
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
                      value={formData.precio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, precio: Number.parseFloat(e.target.value) }))}
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
                      value={formData.stock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number.parseInt(e.target.value) }))}
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
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, tipo: value as "propio" | "dropshipping" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
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
                          value={formData.imagen_url}
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
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
                  />
                  <Label htmlFor="activo">Producto activo (visible en la tienda)</Label>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crear Producto
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
    </div>
  )
}
