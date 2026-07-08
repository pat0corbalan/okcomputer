"use client"

import Link from "next/link"
import { Search, ShoppingCart, Cpu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { storeConfig } from "@/lib/store-config"

type SiteHeaderProps = {
  search?: string
  onSearchChange?: (value: string) => void
}

export function SiteHeader({ search = "", onSearchChange }: SiteHeaderProps) {
  const { totalItems, setOpen } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* CONTENEDOR PRINCIPAL FLUIDO */}
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LOGO TIENDA */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-xs transition-all duration-200 active:scale-95 group-hover:scale-105">
              <Cpu className="h-4 w-4" />
            </span>
            <span className="font-sans text-sm md:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {storeConfig.name}
            </span>
          </Link>

          {/* BUSCADOR ERGONÓMICO CENTRALIZADO (Oculto en barra inferior en Mobile, activo arriba en Desktop) */}
          {onSearchChange && (
            <div className="flex-1 max-w-md mx-auto w-full hidden md:block group relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 transition-colors group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100" />
              <Input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="¿Qué estás buscando hoy?"
                className="h-10 w-full pl-10 pr-10 text-xs bg-zinc-100/90 dark:bg-zinc-900/90 border-0 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-100/10 focus-visible:bg-white dark:focus-visible:bg-zinc-950 transition-all rounded-xl placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
                aria-label="Buscar productos"
              />
              {search && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          )}

          {/* BOTÓN CARRITO DESKTOP */}
          <div className="flex items-center shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-xl text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 active:scale-95 transition-all"
              onClick={() => setOpen(true)}
              aria-label={`Abrir carrito, ${totalItems} productos`}
            >
              <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 px-1.5 text-[10px] font-bold ring-2 ring-white dark:ring-zinc-950 shadow-xs animate-in zoom-in duration-200">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

        </div>

        {/* CONTENEDOR DE BÚSQUEDA EXCLUSIVO PARA MOBILE (Se posiciona abajo del logo fluidamente sin romper layouts) */}
        {onSearchChange && (
          <div className="pb-3 md:hidden group relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar marcas, productos o SKU..."
              className="h-11 w-full pl-10 pr-10 text-xs bg-zinc-100 dark:bg-zinc-900 border-0 focus-visible:ring-2 focus-visible:ring-zinc-900/5 transition-all rounded-xl placeholder:text-zinc-400 font-medium"
              aria-label="Buscar productos"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 active:text-zinc-900"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}
        
      </div>
    </header>
  )
}

export default SiteHeader;