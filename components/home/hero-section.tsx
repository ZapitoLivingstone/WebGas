import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="w-full">
      {/* SACAMOS el container, usamos w-full */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
          {/* IZQUIERDA: Bloque rojo con texto */}
          <div className="bg-[#C22320] flex flex-col justify-center px-8 py-16 lg:py-24 min-h-[420px]">
            <h1 className="text-4xl md:text-5xl font-black uppercase text-white mb-6 leading-tight">
              Soluciones de <br />Calefacción
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 font-medium">
              Ofrecemos productos y servicios para calefaccionar hogares, hoteles y más.
            </p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Button
                size="lg"
                className="bg-[#FFD200] hover:bg-[#ffe244] text-[#C22320] font-bold text-base px-8 py-2 rounded-full shadow"
                asChild
              >
                <Link href="/products">Ver Productos</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-red-700 font-bold text-base px-8 py-2 rounded-full hover:bg-white hover:text-[#C22320] hover:border-[#C22320] shadow"
                asChild
              >
                <Link href="/categories">Explorar Categorías</Link>
              </Button>
            </div>
          </div>
          {/* DERECHA: Bloque azul con imagen */}
          <div className="bg-[#ffffff] flex items-center justify-center px-8 py-16 lg:py-24">
            <Image
              src="/logo-plasgas-sin-fondo.png"
              alt="Calefón moderno"
              width={350}
              height={420}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
