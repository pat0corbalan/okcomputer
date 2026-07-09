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
    // Transformado a cristal azul noche con borde sutil translúcido
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0f1d]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* CONTENEDOR PRINCIPAL FLUIDO */}
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LOGO TIENDA */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            {/* Icono Cpu adaptado al estilo neón cian de tu imagen */}
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all duration-200 active:scale-95 group-hover:scale-105">
              <Cpu className="h-4 w-4" />
            </span>
            <span className="font-sans text-sm md:text-base font-bold tracking-tight text-white group-hover:text-neon-cyan transition-colors">
              {storeConfig.name}
            </span>
          </Link>

          {/* BUSCADOR ERGONÓMICO CENTRALIZADO */}
          {onSearchChange && (
            <div className="flex-1 max-w-md mx-auto w-full hidden md:block group relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-neon-cyan" />
              <Input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="¿Qué estás buscando hoy?"
                // Cambiado bg-zinc-100 por un tono integrado de cristal oscuro e iluminación cian en focus
                className="h-10 w-full pl-10 pr-10 text-xs bg-[#121b2e]/60 border border-white/5 focus-visible:ring-2 focus-visible:ring-neon-cyan/40 focus-visible:bg-[#0d1527] text-white transition-all rounded-xl placeholder:text-gray-500 font-medium"
                aria-label="Buscar productos"
              />
              {search && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-white transition-colors"
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
              className="relative h-10 w-10 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white active:scale-95 transition-all"
              onClick={() => setOpen(true)}
              aria-label={`Abrir carrito, ${totalItems} productos`}
            >
              <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
              {totalItems > 0 && (
                // Indicador flotante utilizando el naranja vibrante de tu marca
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground px-1.5 text-[10px] font-bold ring-2 ring-[#0a0f1d] shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-in zoom-in duration-200">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

        </div>

        {/* CONTENEDOR DE BÚSQUEDA EXCLUSIVO PARA MOBILE */}
        {onSearchChange && (
          <div className="pb-3 md:hidden group relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar marcas, productos o SKU..."
              className="h-11 w-full pl-10 pr-10 text-xs bg-[#121b2e]/60 border border-white/5 focus-visible:ring-2 focus-visible:ring-neon-cyan/40 focus-visible:bg-[#0d1527] text-white transition-all rounded-xl placeholder:text-gray-500 font-medium"
              aria-label="Buscar productos"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 active:text-white transition-colors"
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