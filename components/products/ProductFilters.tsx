// components/products/ProductFilters.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Search } from "lucide-react"

interface Props {
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  categories: { id: number; nombre: string }[]
  handleSearch: (e: React.FormEvent) => void
}

export function ProductFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  handleSearch
}: Props) {
  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <div>
        <h3 className="font-semibold mb-3">Buscar</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {/* Categorías */}
      <div>
        <h3 className="font-semibold mb-3">Categorías</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Ordenamiento */}
      <div>
        <h3 className="font-semibold mb-3">Ordenar por</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nombre">Nombre A-Z</SelectItem>
            <SelectItem value="precio_asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="precio_desc">Precio: Mayor a Menor</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
