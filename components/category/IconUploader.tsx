"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadImageToService } from "@/lib/image-upload"

interface IconUploaderProps {
  iconUrl: string
  setIconUrl: (url: string) => void
  label?: string
}

export function IconUploader({ iconUrl, setIconUrl, label = "Icono (opcional)" }: IconUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(iconUrl || "")
  const { toast } = useToast()

  // Lógica para generar un ícono genérico (puedes adaptar/expandir)
  const generateIconUrl = () => {
    if (!iconUrl?.trim()) {
      toast({
        title: "Info",
        description: "Ingresa primero el nombre o sube una imagen",
      })
      return
    }
    const name = iconUrl.replace(/[^a-z0-9]/gi, "-").toLowerCase()
    // Aquí puedes poner más variantes si quieres
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128`
    setIconUrl(url)
    setPreview(url)
    toast({ title: "Icono generado", description: "Se generó un icono automáticamente" })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "El archivo debe ser una imagen", variant: "destructive" })
      return
    }
    if (file.size > 1 * 1024 * 1024) {
      toast({ title: "Error", description: "La imagen no debe superar 1MB", variant: "destructive" })
      return
    }
    setIsUploading(true)
    try {
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)
      const url = await uploadImageToService(file)
      if (url) {
        setIconUrl(url)
        setPreview(url)
        toast({ title: "Imagen subida", description: "La imagen se ha subido correctamente" })
      } else {
        throw new Error("No se pudo subir el icono")
      }
    } catch (err) {
      setPreview(iconUrl || "")
      toast({ title: "Error", description: "No se pudo subir el icono", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="flex-1"
        />
        <Input
          placeholder="URL del icono o nombre"
          value={iconUrl}
          onChange={e => {
            setIconUrl(e.target.value)
            setPreview(e.target.value)
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={generateIconUrl} disabled={isUploading}>
          <Plus className="h-4 w-4 mr-1" /> Generar
        </Button>
        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      {preview && (
        <div className="relative w-16 h-16 border rounded overflow-hidden mt-2">
          <img
            src={preview}
            alt="icon preview"
            className="w-full h-full object-cover"
            onError={() => setPreview("")}
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-5 w-5 p-0"
            onClick={() => {
              setIconUrl("")
              setPreview("")
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
