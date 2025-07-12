"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  onClose: () => void
  resumen: any
  turno: any
  userEmail: string
  onConfirm: () => void
}

export function POSDialogResumenTurno({ open, onClose, resumen, turno, userEmail, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resumen del turno</DialogTitle>
        </DialogHeader>
        {resumen && (
          <div>
            <div className="mb-2"><b>Vendedor:</b> {userEmail}</div>
            <div className="mb-2"><b>Efectivo inicial:</b> ${turno?.efectivo_inicial}</div>
            <div className="mb-2"><b>Efectivo final (ventas efectivo):</b> ${resumen.efectivo + turno?.efectivo_inicial}</div>
            <div className="mb-2"><b>Débito:</b> ${resumen.debito}</div>
            <div className="mb-2"><b>Crédito:</b> ${resumen.credito}</div>
            <div className="mb-2"><b>Transferencia:</b> ${resumen.transferencia}</div>
            <div className="mb-2"><b>Total ventas:</b> ${resumen.total}</div>
            <div className="mb-3"><b>Ventas del turno:</b></div>
            <ul className="max-h-[200px] overflow-y-auto mb-2 text-xs">
              {resumen.ventas.map((v: any, idx: number) => (
                <li key={idx}>
                  #{v.id} - {v.metodo_pago} - ${v.total_final} - {new Date(v.created_at).toLocaleTimeString("es-CL")}
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
              <Button onClick={onConfirm}>Confirmar cierre de turno</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
