import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto - Gásfiter Pro",
  description: "Ponte en contacto con Gásfiter Pro. Estamos aquí para ayudarte",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Contáctanos</h1>
        <p className="text-gray-600">
          Estamos aquí para ayudarte. Ponte en contacto con nosotros a través de cualquiera de estos medios.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Envíanos un mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    Nombre
                  </label>
                  <Input id="firstName" placeholder="Tu nombre" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Apellido
                  </label>
                  <Input id="lastName" placeholder="Tu apellido" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input id="email" type="email" placeholder="tu@email.com" />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Teléfono
                </label>
                <Input id="phone" placeholder="+56 9 1234 5678" />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Asunto
                </label>
                <Input id="subject" placeholder="¿En qué podemos ayudarte?" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Mensaje
                </label>
                <Textarea id="message" placeholder="Describe tu consulta o solicitud..." rows={5} />
              </div>

              <Button type="submit" className="w-full">
                Enviar Mensaje
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Av. Providencia 1234
                <br />
                Providencia, Santiago
                <br />
                Región Metropolitana, Chile
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Teléfono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                <strong>Ventas:</strong> +56 2 2345 6789
                <br />
                <strong>Soporte:</strong> +56 2 2345 6790
                <br />
                <strong>WhatsApp:</strong> +56 9 8765 4321
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                <strong>Ventas:</strong> ventas@gasfiterpro.cl
                <br />
                <strong>Soporte:</strong> soporte@gasfiterpro.cl
                <br />
                <strong>General:</strong> info@gasfiterpro.cl
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Horarios de Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600">
                <p>
                  <strong>Lunes a Viernes:</strong> 8:00 - 18:00
                </p>
                <p>
                  <strong>Sábados:</strong> 9:00 - 14:00
                </p>
                <p>
                  <strong>Domingos:</strong> Cerrado
                </p>
                <p className="mt-2 text-sm">
                  <strong>Atención online:</strong> 24/7 a través de nuestro sitio web
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Cómo llegar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Mapa interactivo - Av. Providencia 1234, Providencia</p>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Metro más cercano:</strong> Estación Pedro de Valdivia (Línea 1)
              </p>
              <p>
                <strong>Buses:</strong> Líneas 210, 213, 214, 505
              </p>
              <p>
                <strong>Estacionamiento:</strong> Disponible en el edificio
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
