"use client"

import { useEffect, useMemo, useRef, useState, useTransition, useCallback } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/hero"
import ProductCard from "@/components/product-card"
import { AdvancedFilters } from "@/components/advanced-filters"
import { CartSheet } from "@/components/cart-sheet"
import { Product } from "@/lib/products"
import { useDebounce } from "@/hooks/use-debounce"
import { useCart } from "@/lib/cart-context"

import {
  Loader2,
  PackageSearch,
  Search,
  SlidersHorizontal,
  ShoppingBag,
} from "lucide-react"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useProductFilters } from "@/hooks/useProductFilters"
import { cn } from "@/lib/utils"

const INITIAL_PAGE_SIZE = 12
const SCROLL_PAGE_SIZE = 24

export default function Page() {
  /* ---------------- STATE & TRANSITIONS ---------------- */
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  const { setOpen: setCartOpen } = useCart()

  const [localSearch, setLocalSearch] = useState("")
  const debouncedSearch = useDebounce(localSearch, 250)

  const loaderRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(INITIAL_PAGE_SIZE)

  /* ---------------- DATA FETCHING ---------------- */
  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const res = await fetch("/api/products")
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (isMounted) setProducts(data)
      } catch (err) {
        console.error("Error cargando productos", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  /* ---------------- BLINDAJE ANTI RE-RENDER ---------------- */
  // Memorizamos el array de productos para que useProductFilters NO reciba una referencia nueva en cada render.
  const memoizedProducts = useMemo(() => products, [products])

  const { filters, setFilters, filtered } = useProductFilters(memoizedProducts)

  // Sincronización del buscador controlando la ejecución exacta
  useEffect(() => {
    // Solo actualizamos si el valor real de la query en el hook es diferente al debounced
    if (filters.q !== debouncedSearch) {
      startTransition(() => {
        setFilters({ q: debouncedSearch })
      })
    }
  }, [debouncedSearch, setFilters, filters.q])

  // Sincronización inversa controlada
  useEffect(() => {
    if (filters.q !== undefined && filters.q !== localSearch) {
      setLocalSearch(filters.q)
    }
  }, [filters.q])

  /* ---------------- PAGINACIÓN VIRTUAL ---------------- */
  const visibleProducts = useMemo(() => {
    return filtered.slice(0, visible)
  }, [filtered, visible])

  // Reseteamos el conteo de páginas de forma segura guardando la última query ejecutada en un Ref
  const lastFiltersRef = useRef(JSON.stringify(filters))
  useEffect(() => {
    const currentFiltersStr = JSON.stringify(filters)
    if (lastFiltersRef.current !== currentFiltersStr) {
      lastFiltersRef.current = currentFiltersStr
      setVisible(INITIAL_PAGE_SIZE)
    }
  }, [filters])

  /* ---------------- INFINITE SCROLL EFECTIVO ---------------- */
  useEffect(() => {
    if (loading || isPending) return
    if (visible >= filtered.length) return

    const el = loaderRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTransition(() => {
            setVisible((v) => Math.min(v + SCROLL_PAGE_SIZE, filtered.length))
          })
        }
      },
      { rootMargin: "400px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [filtered.length, visible, loading, isPending])

  /* ---------------- UX ACTIONS MEMOIZADAS ---------------- */
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.q ||
      (filters.cat && filters.cat !== "all") ||
      (filters.sub && filters.sub !== "all") ||
      (filters.brand && filters.brand !== "all")
    )
  }, [filters])

  const clearAll = useCallback(() => {
    setLocalSearch("")
    startTransition(() => {
      setFilters({
        q: "",
        cat: "all",
        sub: "all",
        brand: "all",
      })
    })
  }, [setFilters])

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      
      <SiteHeader
        search={localSearch}
        onSearchChange={setLocalSearch}
      />

      <Hero />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 pb-24 md:pb-8">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Descubrir productos</h1>
            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 h-4">
              <span>{filtered.length} resultados</span>
              {isPending && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* LAYOUT */}
        <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
          
          {/* SIDEBAR (DESKTOP) */}
          <aside className="hidden md:block sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
            <AdvancedFilters
              products={memoizedProducts}
              selectedCategory={filters.cat}
              onCategoryChange={(v) => startTransition(() => setFilters({ cat: v, sub: "all", brand: "all" }))}
              selectedSubcategory={filters.sub}
              onSubcategoryChange={(v) => startTransition(() => setFilters({ sub: v, brand: "all" }))}
              selectedBrand={filters.brand}
              onBrandChange={(v) => startTransition(() => setFilters({ brand: v }))}
              onReset={clearAll}
            />
          </aside>

          {/* SECCIÓN DE RESULTADOS */}
          <section className="space-y-6">
            {loading ? (
              <Skeleton />
            ) : filtered.length === 0 ? (
              <Empty onReset={clearAll} />
            ) : (
              <>
                <div 
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 transition-opacity duration-200"
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px', opacity: isPending ? 0.8 : 1 }}
                >
                  {visibleProducts.map((p) => (
                    <ProductCard
                      key={p._id?.toString?.() || p.sku}
                      product={p}
                    />
                  ))}
                </div>

                {/* DISPARADOR DEL SCROLL INVISIBLE */}
                <div ref={loaderRef} className="py-12 flex justify-center items-center min-h-[60px]">
                  {visible < filtered.length && (
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando más productos expertos...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* 📱 NAVBAR INFERIOR MÓVIL SMART */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center z-40 px-2 shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
          className="flex flex-col items-center justify-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 active:text-zinc-900 dark:active:text-zinc-100 h-full w-full"
        >
          <Search className="h-5 w-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold">Buscar</span>
        </button>

        <button
          onClick={() => setMobileFiltersOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-xs h-full w-full transition-colors",
            hasActiveFilters ? "text-zinc-900 dark:text-zinc-100 font-bold" : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          <SlidersHorizontal className="h-5 w-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold">Filtros</span>
        </button>

        <button 
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 active:text-zinc-900 dark:active:text-zinc-100 h-full w-full"
        >
          <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold">Carrito</span>
        </button>
      </div>

      <CartSheet />

      {/* 📋 HOJA DE FILTROS MÓVIL */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl bg-white dark:bg-zinc-950 flex flex-col overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
          <div className="w-full flex flex-col items-center pt-3 pb-2 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
            <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mb-2" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Filtros Avanzados</span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain pb-12 custom-scrollbar">
            <AdvancedFilters
              products={memoizedProducts}
              selectedCategory={filters.cat}
              onCategoryChange={(v) => startTransition(() => setFilters({ cat: v, sub: "all", brand: "all" }))}
              selectedSubcategory={filters.sub}
              onSubcategoryChange={(v) => startTransition(() => setFilters({ sub: v, brand: "all" }))}
              selectedBrand={filters.brand}
              onBrandChange={(v) => startTransition(() => setFilters({ brand: v }))}
              onReset={clearAll}
            />
          </div>
          
          <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 shrink-0 flex gap-3">
            <button 
              onClick={clearAll}
              disabled={!hasActiveFilters}
              className="px-4 rounded-xl border border-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold text-xs disabled:opacity-40"
            >
              Borrar
            </button>
            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-bold text-sm dark:bg-zinc-50 dark:text-zinc-950 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Ver ${filtered.length} productos`
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden md:block">
        <SiteFooter />
      </div>
    </div>
  )
}

/* ---------------- UI STATES ---------------- */
function Skeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4.2] rounded-2xl bg-zinc-200 dark:bg-zinc-900 animate-pulse" />
      ))}
    </div>
  )
}

function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-20 text-center border border-dashed rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-transparent">
      <PackageSearch className="mx-auto h-6 w-6 text-zinc-400" />
      <p className="text-xs mt-2 text-zinc-500">No encontramos resultados para tu búsqueda</p>
      <button onClick={onReset} className="text-xs underline mt-2 text-zinc-900 dark:text-zinc-100 font-semibold">
        Reiniciar catálogo
      </button>
    </div>
  )
}