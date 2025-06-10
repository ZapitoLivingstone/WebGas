// components/products/ProductPagination.tsx
import { Button } from "@/components/ui/button"

interface Props {
  currentPage: number
  totalPages: number
  setCurrentPage: (n: number) => void
}

export function ProductPagination({ currentPage, totalPages, setCurrentPage }: Props) {
  if (totalPages <= 1) return null
  return (
    <div className="flex justify-center mt-8">
      <nav className="flex gap-2">
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Anterior
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            variant={currentPage === i + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Siguiente
        </Button>
      </nav>
    </div>
  )
}
