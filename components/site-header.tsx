"use client"

import Link from "next/link"
import { Search, ShoppingCart, Cpu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { storeConfig } from "@/lib/store-config"

type SiteHeaderProps = {
  search?: string
  onSearchChange?: (value: string) => void
}

export function SiteHeader({ search, onSearchChange }: SiteHeaderProps) {
  const { totalItems, setOpen } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cpu className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            {storeConfig.name}
          </span>
        </Link>

        {onSearchChange && (
          <div className="relative hidden flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-9"
              aria-label="Buscar productos"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setOpen(true)}
            aria-label={`Abrir carrito, ${totalItems} productos`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>

      {onSearchChange && (
        <div className="border-t border-border px-4 py-2 sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-9"
              aria-label="Buscar productos"
            />
          </div>
        </div>
      )}
    </header>
  )
}
