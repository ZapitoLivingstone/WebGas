/**
 * Servicio para subir imágenes y convertirlas a URLs
 */
export async function uploadImageToService(file: File): Promise<string> {
  // Primero intentamos con ImgBB (requiere API key)
  try {
    const imgbbUrl = await uploadToImgBB(file)
    if (imgbbUrl) return imgbbUrl
  } catch (error) {
    console.error("Error uploading to ImgBB:", error)
  }

  // Si falla, intentamos con PostImage (no requiere API key)
  try {
    const postImageUrl = await uploadToPostImage(file)
    if (postImageUrl) return postImageUrl
  } catch (error) {
    console.error("Error uploading to PostImage:", error)
  }

  // Como último recurso, convertimos a base64 (no recomendado para producción)
  return convertToBase64(file)
}

async function uploadToImgBB(file: File): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  if (!apiKey) return null

  const formData = new FormData()
  formData.append("image", file)
  formData.append("key", apiKey)

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) throw new Error("ImgBB upload failed")

  const data = await response.json()
  return data.data.url
}

async function uploadToPostImage(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("https://postimages.org/json/rr", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) throw new Error("PostImage upload failed")

  const data = await response.json()
  return data.url
}

function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
