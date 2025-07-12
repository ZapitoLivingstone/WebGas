"use client"
import { Button } from "@/components/ui/button"

interface Props {
  turno: any
  onIniciar: () => void
  onTerminar: () => void
}

export function POSCajaTurnoBar({ turno, onIniciar, onTerminar }: Props) {
  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
      {!turno ? (
        <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={onIniciar}>
          Iniciar turno de caja
        </Button>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold" onClick={onTerminar}>
            Terminar turno de caja
          </Button>
          <div className="text-sm text-gray-600 ml-0 md:ml-4">
            <b>Turno abierto</b> por: <span className="text-[#C22320]">{turno.usuario_email}</span><br />
            <b>Inicio:</b> {new Date(turno.inicio).toLocaleString("es-CL")}<br />
            <b>Efectivo inicial:</b> ${turno.efectivo_inicial}
          </div>
        </div>
      )}
    </div>
  )
}
