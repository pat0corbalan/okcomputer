"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/store-config"
import { getCategoryName, type Product } from "@/lib/products"
import { toast } from "sonner"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const BASE_URL = "http://importcellsgo.ddns.net"

  // --- OBTENCIÓN ROBUSTA DE LA URL DE LA IMAGEN ---
  const getImageUrl = () => {
    // 1. Si tu scraper ya guardó la ruta en DB (ej: 'tienda/catalogo/1060.jpg')
    if (product.image) {
      if (product.image.startsWith("http")) return product.image
      return `${BASE_URL}/${product.image.replace(/^\//, "")}`
    }

    // 2. Si por algún motivo falló pero tenemos el código de artículo original o ID
    const identificador = product.codigo_original || product.id || (product as any)._id
    if (identificador) {
      return `${BASE_URL}/tienda/catalogo/${identificador}.jpg`
    }

    return null
  }

  const imageUrl = getImageUrl()
  const [imageError, setImageError] = useState(false)

  function handleAdd() {
    addItem(product, 1)
    toast.success("Agregado al carrito", {
      description: product.name,
    })
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative aspect-square overflow-hidden bg-muted/40 flex items-center justify-center">
        
        {!imageUrl || imageError ? (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
            <ImageOff className="h-10 w-10 stroke-[1.5]" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">Sin imagen</span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              setImageError(true)
            }}
            unoptimized 
          />
        )}

        <span className="absolute left-2 top-2 rounded-md bg-background/70 px-2 py-0.5 text-xs text-muted-foreground backdrop-blur">
          {getCategoryName(product.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-pretty font-medium leading-snug line-clamp-2 h-[2.75rem]">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">
          {product.description || "Sin descripción disponible."}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-display text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button size="sm" onClick={handleAdd} aria-label={`Agregar ${product.name} al carrito`}>
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}