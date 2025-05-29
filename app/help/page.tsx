import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Centro de Ayuda - Gásfiter Pro",
  description: "Encuentra respuestas a las preguntas más frecuentes sobre Gásfiter Pro",
}

const faqs = [
  {
    question: "¿Cómo puedo realizar un pedido?",
    answer:
      "Puedes realizar un pedido de varias formas: 1) A través de nuestra tienda online agregando productos al carrito, 2) Llamando a nuestro número de ventas, 3) Visitando nuestra tienda física. Para pedidos online, simplemente navega por nuestros productos, agrégalos al carrito y procede al checkout.",
  },
  {
    question: "¿Cuáles son los métodos de pago disponibles?",
    answer:
      "Aceptamos múltiples métodos de pago: tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria, y pago en efectivo en nuestra tienda física. Para compras online, el pago se procesa de forma segura a través de nuestro sistema.",
  },
  {
    question: "¿Hacen envíos a todo Chile?",
    answer:
      "Sí, realizamos envíos a todo Chile. Los tiempos de entrega varían según la región: Región Metropolitana (1-2 días hábiles), regiones cercanas (2-3 días hábiles), regiones extremas (3-5 días hábiles). Los costos de envío se calculan automáticamente según el destino y peso del pedido.",
  },
  {
    question: "¿Puedo devolver un producto?",
    answer:
      "Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en su estado original y con su embalaje. Para iniciar una devolución, contacta a nuestro servicio al cliente con tu número de pedido.",
  },
  {
    question: "¿Ofrecen garantía en los productos?",
    answer:
      "Todos nuestros productos cuentan con garantía del fabricante. La duración varía según el producto: herramientas (1-2 años), grifería (2-5 años), calefont y calderas (1-3 años). Además, ofrecemos garantía de satisfacción de 30 días en todos los productos.",
  },
  {
    question: "¿Tienen stock de todos los productos mostrados?",
    answer:
      "Mantenemos stock de la mayoría de nuestros productos. Los productos marcados como 'Dropshipping' se solicitan directamente al proveedor y pueden tomar 3-7 días adicionales. El stock se actualiza en tiempo real en nuestra página web.",
  },
  {
    question: "¿Ofrecen asesoría técnica?",
    answer:
      "Sí, nuestro equipo de expertos está disponible para brindarte asesoría técnica gratuita. Puedes contactarnos por teléfono, email o chat en línea. También ofrecemos guías de instalación y videos tutoriales en nuestro sitio web.",
  },
  {
    question: "¿Tienen descuentos para profesionales?",
    answer:
      "Sí, ofrecemos precios especiales para gasfiteres profesionales, empresas constructoras y distribuidores. Para acceder a estos precios, debes registrarte como cliente profesional y proporcionar la documentación correspondiente.",
  },
]

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Centro de Ayuda</h1>
        <p className="text-gray-600">Encuentra respuestas rápidas a las preguntas más frecuentes</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <HelpCircle className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">FAQ</h3>
            <p className="text-sm text-gray-600">Preguntas frecuentes</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <MessageCircle className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Chat en Vivo</h3>
            <p className="text-sm text-gray-600">Habla con nosotros</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Phone className="h-8 w-8 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">Llámanos</h3>
            <p className="text-sm text-gray-600">+56 2 2345 6789</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Mail className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-gray-600">soporte@gasfiterpro.cl</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>¿No encontraste lo que buscabas?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Si no pudiste resolver tu consulta con las preguntas frecuentes, nuestro equipo de soporte está listo para
            ayudarte.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/contact">Contactar Soporte</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="tel:+56223456789">Llamar Ahora</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
