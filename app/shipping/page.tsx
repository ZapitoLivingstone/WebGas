import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, MapPin, Package, CreditCard } from "lucide-react"

export const metadata: Metadata = {
  title: "Información de Envíos - Gásfiter Pro",
  description: "Conoce nuestras opciones de envío, tiempos de entrega y costos",
}

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Información de Envíos</h1>
        <p className="text-gray-600">Conoce nuestras opciones de envío, tiempos de entrega y políticas</p>
      </div>

      {/* Shipping Options */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-600" />
              Envío Estándar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">$3.990</p>
              <p className="text-sm text-gray-600">Región Metropolitana</p>
              <Badge variant="secondary">3-5 días hábiles</Badge>
              <p className="text-sm">Ideal para pedidos regulares sin urgencia</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Envío Express
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">$6.990</p>
              <p className="text-sm text-gray-600">Región Metropolitana</p>
              <Badge variant="secondary">1-2 días hábiles</Badge>
              <p className="text-sm">Para cuando necesitas tus productos rápido</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Retiro en Tienda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-600">Gratis</p>
              <p className="text-sm text-gray-600">Av. Providencia 1234</p>
              <Badge variant="secondary">Mismo día</Badge>
              <p className="text-sm">Retira tu pedido cuando te convenga</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Shipping */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Envíos a Regiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Región</th>
                  <th className="text-left p-2">Tiempo de Entrega</th>
                  <th className="text-left p-2">Costo Estándar</th>
                  <th className="text-left p-2">Costo Express</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Región Metropolitana</td>
                  <td className="p-2">1-3 días hábiles</td>
                  <td className="p-2">$3.990</td>
                  <td className="p-2">$6.990</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">V, VI, VII, VIII Región</td>
                  <td className="p-2">2-4 días hábiles</td>
                  <td className="p-2">$5.990</td>
                  <td className="p-2">$9.990</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">I, II, III, IV, IX, X, XIV Región</td>
                  <td className="p-2">3-5 días hábiles</td>
                  <td className="p-2">$7.990</td>
                  <td className="p-2">$12.990</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">XI, XII Región</td>
                  <td className="p-2">4-7 días hábiles</td>
                  <td className="p-2">$12.990</td>
                  <td className="p-2">$19.990</td>
                </tr>
                <tr>
                  <td className="p-2">XV Región (Arica)</td>
                  <td className="p-2">3-5 días hábiles</td>
                  <td className="p-2">$8.990</td>
                  <td className="p-2">$14.990</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Free Shipping */}
      <Card className="mb-8 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">🎉 Envío Gratis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">¡Obtén envío gratis en tus compras!</p>
          <ul className="space-y-2 text-green-700">
            <li>
              • <strong>Región Metropolitana:</strong> Compras sobre $50.000
            </li>
            <li>
              • <strong>Regiones:</strong> Compras sobre $80.000
            </li>
            <li>
              • <strong>Clientes Profesionales:</strong> Envío gratis desde $30.000
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Shipping Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Proceso de Envío
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Confirmas tu Pedido</h4>
              <p className="text-sm text-gray-600">Recibes confirmación por email</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Preparamos tu Pedido</h4>
              <p className="text-sm text-gray-600">Empacamos con cuidado</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Enviamos</h4>
              <p className="text-sm text-gray-600">Te enviamos código de seguimiento</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold mb-2">Recibes tu Pedido</h4>
              <p className="text-sm text-gray-600">En la dirección indicada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Importante</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Los tiempos de entrega son días hábiles (lunes a viernes)</li>
              <li>• Los envíos se realizan de 9:00 a 18:00 hrs</li>
              <li>• Es necesario que alguien reciba el pedido</li>
              <li>• Productos pesados pueden requerir ayuda para descarga</li>
              <li>• Verificamos dirección antes del envío</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Seguimiento de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Una vez que tu pedido sea despachado, recibirás:</p>
            <ul className="space-y-2 text-sm">
              <li>• Email con código de seguimiento</li>
              <li>• SMS con link de rastreo</li>
              <li>• Notificación el día de entrega</li>
              <li>• Posibilidad de reprogramar entrega</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
