// app/webpay/thanks/page.tsx

"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useCart } from "@/hooks/use-cart" 
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export default function ThanksPage() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [amount, setAmount] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { clearCart } = useCart();

  useEffect(() => {
    setOrder(searchParams.get("buyOrder"))
    setStatus(searchParams.get("status"))
    setAmount(searchParams.get("amount"))
    setError(searchParams.get("error"))
  }, [searchParams])

  useEffect(() => {
    if (status === "ok") clearCart();
  }, [status, clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center bg-white rounded-xl shadow-md p-8">
          {status === "ok" ? (
            <>
              <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
              <p className="mb-2">Tu pago fue procesado exitosamente.</p>
              {order && (
                <p className="mb-2">
                  <b>Número de orden:</b> {order}
                </p>
              )}
              {amount && (
                <p className="mb-2">
                  <b>Monto:</b> ${amount}
                </p>
              )}
              <Button className="mt-4" onClick={() => window.location.href = "/"}>
                Volver a la tienda
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4 text-red-600">Ocurrió un problema</h1>
              <p className="mb-2">No pudimos procesar tu pago.</p>
              {error && <p className="text-red-600 mb-2">{decodeURIComponent(error)}</p>}
              <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/"}>
                Volver al inicio
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
