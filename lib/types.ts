export interface Product {
  [x: string]: any
  id: number
  nombre: string
  precio: number
  stock: number | null
  tipo: string
  imagen_url: string
  categoria_id?: number
  categoria_nombre?: string | null
}

export interface Categoria {
  id: number
  nombre: string
}

export interface CartItem {
  product: Product
  quantity: number
}
export interface User {
  id: string
  email: string
  role: "admin" | "trabajador" | "cliente"
}
