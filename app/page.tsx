"use client"

import { useEffect, useMemo, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/hero"
import { CategoryFilter } from "@/components/category-filter"
import { ProductCard } from "@/components/product-card"
import { CartSheet } from "@/components/cart-sheet"
import { type CategoryId, type Product } from "@/lib/products"
import { PackageSearch, Loader2 } from "lucide-react"

export default function HomePage() {
  // Cambiamos el array estático por un estado dinámico
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<CategoryId | "all">("all")

  // Llamada a tu API de Next.js que consulta Mongoose
  useEffect(() => {
    async function getProducts() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error("No se pudo obtener el catálogo de la base de datos")
        }
        const data = await response.json()
        setDbProducts(data)
      } catch (err: any) {
        setError(err.message || "Ocurrió un error inesperado")
      } finally {
        setIsLoading(false)
      }
    }
    getProducts()
  }, [])

  // El filtrado en memoria se mantiene idéntico, pero ahora usa 'dbProducts'
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return dbProducts.filter((p) => {
      const matchesCategory = category === "all" || p.category === category
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, category, dbProducts])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader search={search} onSearchChange={setSearch} />
      <main className="flex-1">
        <Hero />

        <section id="productos" className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Productos</h2>
              {!isLoading && !error && (
                <p className="text-sm text-muted-foreground">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "producto disponible" : "productos disponibles"}
                </p>
              )}
            </div>
            <CategoryFilter active={category} onChange={setCategory} />
          </div>

          {/* Control visual de estados en el catálogo */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Sincronizando stock en tiempo real...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center text-destructive">
              <p className="font-medium">Error al cargar productos</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
              <PackageSearch className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                No encontramos productos para tu búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard 
                  // Usamos el id de Mongo (_id) o id en su defecto como key
                  key={product._id || product.id} 
                  product={product} 
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
      <CartSheet />
    </div>
  )
}