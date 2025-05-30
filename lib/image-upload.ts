// Servicio para subir imágenes y convertirlas a URLs sin usar storage
export async function uploadImageToService(file: File): Promise<string | null> {
  try {
    // Opción 1: Usar ImgBB (requiere API key gratuita)
    const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY

    if (imgbbApiKey) {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.data.url
      }
    }

    // Opción 2: Usar PostImage (sin API key)
    try {
      const formData = new FormData()
      formData.append("upload", file)

      const response = await fetch("https://postimages.org/json/rr", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          return data.url
        }
      }
    } catch (error) {
      console.log("PostImage failed, trying next option...")
    }

    // Opción 3: Convertir a base64 como fallback
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}
