"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConfigurationWarning() {
  const { isConfigured } = useAuth()

  if (isConfigured) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-4">
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Configuración Requerida</AlertTitle>
          <AlertDescription className="text-yellow-700 mt-2">
            <p className="mb-3">
              Para que la aplicación funcione correctamente, necesitas configurar las variables de entorno de Supabase:
            </p>
            <div className="bg-yellow-100 p-3 rounded-md font-mono text-sm mb-3">
              <div>NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                onClick={() => window.open("https://app.supabase.com", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir a Supabase Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                onClick={() => window.open("https://supabase.com/docs/guides/getting-started", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Documentación
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
