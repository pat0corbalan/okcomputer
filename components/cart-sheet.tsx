"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/store-config"

export function CartSheet() {
  const router = useRouter()
  const { items, isOpen, setOpen, setQuantity, removeItem, totalPrice, totalItems } = useCart()

  function goToCheckout() {
    setOpen(false)
    router.push("/checkout")
  }

  // Helper seguro para extraer el ID sin romper las reglas estrictas de TypeScript
  const getProductId = (product: any): string => {
    const id = product.id || product._id || product.sku
    return String(id)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md bg-card border-l border-border">
        
        {/* HEADER DEL CARRITO */}
        <SheetHeader className="p-4 border-b border-border bg-background/50 backdrop-blur-md shrink-0">
          <SheetTitle className="flex items-center gap-2 text-foreground font-bold tracking-tight">
            <ShoppingCart className="h-5 w-5 text-primary stroke-[2.2]" />
            Tu carrito 
            {totalItems > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* CONTENIDO PRINCIPAL */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/60">
              <ShoppingCart className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Tu carrito está vacío.</p>
            <Button variant="outline" size="sm" className="mt-1 rounded-xl shadow-xs" onClick={() => setOpen(false)}>
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            {/* LISTA SCON SCROLL DINÁMICO */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <ul className="flex flex-col gap-3">
                {items.map(({ product, quantity }) => {
                  const productId = getProductId(product)
                  const BASE_URL = "http://importcellsgo.ddns.net/tienda2"
                  
                  // Lógica de fallback para renderizar la imagen exacta del catálogo
                  const imageUrl = product.image 
                    ? (product.image.startsWith("http") ? product.image : `${BASE_URL}/${product.image.replace(/^\//, "")}`)
                    : (product.sku || product.codigo_original ? `${BASE_URL}/catalogo/${product.sku || product.codigo_original}.jpg` : "/placeholder.svg")

                  return (
                    <li key={productId} className="flex gap-3 items-center rounded-xl border border-border/40 bg-background/30 p-2.5 transition-all hover:bg-background/60">
                      
                      {/* IMAGEN MINIATURA (Contenida) */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/20 flex items-center justify-center">
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>

                      {/* DETALLES DEL PRODUCTO */}
                      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold leading-snug text-foreground/90 text-pretty line-clamp-2 pr-1">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(productId)}
                            className="text-muted-foreground/60 transition-colors hover:text-destructive p-1 rounded-md hover:bg-destructive/10"
                            aria-label={`Quitar ${product.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-0.5">
                          {/* CONTROLADOR DE CANTIDADES ERGONÓMICO */}
                          <div className="flex items-center rounded-lg border border-border/80 bg-background/40">
                            <button
                              onClick={() => setQuantity(productId, quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground active:scale-90"
                              aria-label="Restar uno"
                            >
                              <Minus className="h-3 w-3 stroke-[2.5]" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-foreground">
                              {quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(productId, quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground active:scale-90"
                              aria-label="Sumar uno"
                            >
                              <Plus className="h-3 w-3 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* PRECIO SUB-TOTAL */}
                          <div className="text-right">
                            <span className="font-display text-xs font-black text-foreground">
                              {formatPrice(product.price * quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* FOOTER TOTALIZADOR COMPACTO (Fijo abajo siempre) */}
            <div className="border-t border-border bg-background/80 backdrop-blur-md p-4 space-y-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total de la orden</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Impuestos y envío incluidos</span>
                </div>
                <span className="font-display text-xl font-black text-primary tracking-tight">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              
              <Separator className="bg-border/60" />
              
              <Button size="lg" className="w-full h-11 rounded-xl text-xs font-bold shadow-md tracking-wide group" onClick={goToCheckout}>
                Proceder al Checkout
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CartSheet;