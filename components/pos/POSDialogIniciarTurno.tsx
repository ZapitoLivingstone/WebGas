"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  efectivoInicial: string
  setEfectivoInicial: (v: string) => void
}

export function POSDialogIniciarTurno({
  open,
  onClose,
  onSubmit,
  efectivoInicial,
  setEfectivoInicial
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar turno de caja</DialogTitle>
          <DialogDescription>
            Ingresa el efectivo inicial que tendrás en caja para registrar el inicio de tu turno.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="efectivo-inicial">
            Efectivo inicial en caja:
          </label>
          <input
            id="efectivo-inicial"
            type="number"
            value={efectivoInicial}
            min={0}
            onChange={e => setEfectivoInicial(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
            autoFocus
            aria-describedby="efectivo-inicial-desc"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSubmit}>Iniciar turno</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
