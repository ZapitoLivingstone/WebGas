"use client"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface Product {
  id: number
  nombre: string
  precio: number
  stock: number | null
  tipo: string
  imagen_url: string
  categoria_id?: number
  categoria_nombre?: string
}
interface Props {
  products: Product[]
  loading: boolean
  addToCart: (p: Product) => void
  formatPrice: (n: number) => string
}
export function POSProductGrid({ products, loading, addToCart, formatPrice }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4 h-44 flex flex-col items-center animate-pulse bg-gray-50" />
        ))}
      </div>
    )
  }
  if (!products.length) {
    return <p className="col-span-full text-center text-gray-400">No hay productos</p>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[64vh] overflow-y-auto">
      {products.map((product) => (
        <Card key={product.id} className="p-3 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition group"
          onClick={() => addToCart(product)}>
          {product.imagen_url && (
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              width={120}
              height={120}
              className="w-full h-24 object-contain rounded-lg mb-2 bg-white"
            />
          )}
          <h3 className="font-semibold text-xs line-clamp-1 mb-1">{product.nombre}</h3>
          <span className="text-[#C22320] font-bold text-base">{formatPrice(product.precio)}</span>
          {product.stock !== null && (
            <span className={`text-xs font-semibold rounded px-2 py-1 mt-1 ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              Stock: {product.stock}
            </span>
          )}
        </Card>
      ))}
    </div>
  )
}
