import type { Metadata } from "next"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sobre Nosotros - Gásfiter Pro",
  description: "Conoce más sobre Gásfiter Pro, tu tienda especializada en productos de gasfitería",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Sobre Gásfiter Pro</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Somos tu tienda especializada en productos de gasfitería, comprometidos con ofrecer las mejores soluciones
          para profesionales y particulares.
        </p>
      </div>

      {/* Company Story */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-4">Nuestra Historia</h2>
          <p className="text-gray-600 mb-4">
            Fundada en 2010, Gásfiter Pro nació con la misión de proporcionar productos de alta calidad para el sector
            de la gasfitería en Chile. Durante más de una década, hemos construido relaciones sólidas con los mejores
            fabricantes y proveedores del mercado.
          </p>
          <p className="text-gray-600 mb-4">
            Nuestro compromiso con la excelencia nos ha permitido convertirnos en la referencia para profesionales
            gasfiteres, empresas constructoras y particulares que buscan productos confiables y duraderos.
          </p>
          <p className="text-gray-600">
            Hoy, con nuestra plataforma digital, llevamos esta experiencia y calidad directamente a tu hogar u obra, con
            la comodidad de comprar online y recibir tus productos donde los necesites.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/placeholder.svg?height=400&width=500"
            alt="Equipo Gásfiter Pro"
            width={500}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Nuestros Valores</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Calidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Seleccionamos cuidadosamente cada producto para garantizar la máxima calidad y durabilidad en todas
                nuestras soluciones.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Confianza</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Construimos relaciones duraderas basadas en la transparencia, honestidad y cumplimiento de nuestros
                compromisos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Brindamos asesoría especializada y atención personalizada para ayudarte a encontrar la solución
                perfecta.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 rounded-lg p-8 mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Gásfiter Pro en Números</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">13+</div>
            <div className="text-gray-600">Años de experiencia</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">5000+</div>
            <div className="text-gray-600">Productos disponibles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">1500+</div>
            <div className="text-gray-600">Clientes satisfechos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Marcas asociadas</div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Nuestro Compromiso</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          En Gásfiter Pro, no solo vendemos productos, sino que ofrecemos soluciones integrales para tus proyectos de
          gasfitería. Nuestro equipo de expertos está siempre disponible para asesorarte y garantizar que encuentres
          exactamente lo que necesitas.
        </p>
      </div>
    </div>
  )
}
