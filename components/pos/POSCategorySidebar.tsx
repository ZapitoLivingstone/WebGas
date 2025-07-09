"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  searchTerm: string
  setSearchTerm: (val: string) => void
  categories: { id: number, nombre: string }[]
  selectedCategory: number | null
  setSelectedCategory: (val: number | null) => void
}
export function POSCategorySidebar({ searchTerm, setSearchTerm, categories, selectedCategory, setSelectedCategory }: Props) {
  return (
    <aside className="lg:w-1/5 w-full space-y-4">
      <Input
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      <div>
        <h2 className="text-base font-bold mb-2">Categorías</h2>
        <div className="flex lg:flex-col flex-row gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            className="min-w-[100px] flex-shrink-0"
          >Todas</Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              className="min-w-[100px] flex-shrink-0"
            >{cat.nombre}</Button>
          ))}
        </div>
      </div>
    </aside>
  )
}
