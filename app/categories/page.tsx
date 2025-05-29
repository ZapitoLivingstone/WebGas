import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Categorías - Gásfiter Pro",
  description: "Explora todas nuestras categorías de productos para gasfitería",
}

const categories = [
  {
    id: 1,
    name: "Tuberías",
    description: "Tuberías de PVC, cobre y otros materiales",
    productCount: 45,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Conexiones",
    description: "Codos, tees, reducciones y más",
    productCount: 78,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Herramientas",
    description: "Herramientas especializadas para gasfitería",
    productCount: 32,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Grifería",
    description: "Llaves, grifos y accesorios",
    productCount: 56,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "Calefont y Calderas",
    description: "Sistemas de calentamiento de agua",
    productCount: 23,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    name: "Accesorios",
    description: "Accesorios diversos para instalaciones",
    productCount: 67,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Todas las Categorías</h1>
        <p className="text-gray-600">Explora nuestra amplia gama de productos organizados por categorías</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${category.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div
                className="h-48 bg-cover bg-center rounded-t-lg"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <Badge variant="secondary">{category.productCount} productos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
