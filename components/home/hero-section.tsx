import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Todo para tu
              <span className="block text-yellow-400">Proyecto de Plomería</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Encuentra las mejores herramientas, accesorios y materiales para profesionales y particulares. Calidad
              garantizada y envío rápido.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black" asChild>
                <Link href="/products">Ver Productos</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/categories">Explorar Categorías</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/placeholder.svg?height=500&width=600"
              alt="Herramientas de plomería"
              width={600}
              height={500}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
