"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, ImageOff, ShoppingBag, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/store-config"
import { getCategoryName, type Product } from "@/lib/products"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  product: Product
  className?: string
  index?: number
}

export function ProductCard({ product, className, index }: ProductCardProps) {
  const { addItem } = useCart()
  const [isAnimating, setIsAnimating] = useState(false)
  const [imageError, setImageError] = useState(false)
  const BASE_URL = "/api/image"

  // 📦 Detectar si está agotado desde tu DB
  const isOutOfStock = product.agot || product.stock === 0

  const isPriority = index !== undefined && index < 4

  const getImageUrl = () => {
    // 1. Si explícitamente viene una propiedad image
    if (product.image) {
      if (product.image.startsWith("http")) {
        return `${BASE_URL}/${product.image.replace("http://importcellsgo.ddns.net/tienda2/", "")}`;
      }
      return `${BASE_URL}/${product.image.replace(/^\//, "")}`;
    }

    // 2. Fallback usando identificadores (Corregido para manejar el $oid de MongoDB)
    const mongoId = typeof product._id === 'object' && product._id && '$oid' in product._id 
      ? (product._id as any).$oid 
      : product._id;

    const identificador = product.sku || product.codigo_original || mongoId;

    if (identificador) {
      return `${BASE_URL}/catalogo/${identificador}.jpg`;
    }

    return null;
  };

  const imageUrl = getImageUrl()

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation() 
    if (isOutOfStock) return // Seguridad extra

    setIsAnimating(true)
    addItem(product, 1)
    
    toast.success("Agregado al carrito", {
      description: product.name,
      position: "bottom-center", 
    })

    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300",
      "hover:border-primary/40 hover:shadow-md active:scale-[0.98]",
      isOutOfStock && "opacity-75 hover:border-border hover:shadow-xs active:scale-100", // Estilo visual si está agotado
      className
    )}>
      
      {/* CONTENEDOR DE IMAGEN */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/20 flex items-center justify-center border-b border-border/50">
        {!imageUrl || imageError ? (
          <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/30">
            <ImageOff className="h-7 w-7 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Sin imagen</span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className={cn(
              "object-contain p-3 md:p-4 transition-transform duration-500 ease-out",
              !isOutOfStock && "md:group-hover:scale-105",
              isOutOfStock && "grayscale" // Opcional: pone la imagen en gris si no hay stock
            )}
            onError={() => setImageError(true)}
            unoptimized 
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
          />
        )}
        
        {/* Badge de Categoría */}
        <span className="absolute left-2 top-2 rounded-lg bg-background/60 px-2 py-0.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider backdrop-blur-md">
          {getCategoryName(product.category.id)}
        </span>

        {/* Badge de Agotado */}
        {isOutOfStock && (
          <span className="absolute right-2 top-2 rounded-lg bg-destructive/90 px-2 py-0.5 text-[9px] font-bold text-destructive-foreground uppercase tracking-wider shadow-sm">
            Agotado
          </span>
        )}
      </div>

      {/* INFORMACIÓN */}
      <div className="flex flex-1 flex-col p-3 md:p-4 justify-between gap-3 bg-gradient-to-b from-transparent to-card/20">
        
        <div className="flex-1 space-y-1.5">
          <h3 className={cn(
            "text-balance text-xs md:text-sm font-bold leading-snug text-foreground/90 tracking-tight transition-colors",
            !isOutOfStock && "group-hover:text-foreground",
            isOutOfStock && "text-muted-foreground"
          )}>
            {product.name}
          </h3>
          
          <p className="hidden md:line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {product.description || "Sin descripción disponible."}
          </p>
        </div>
        
        {/* FILA DE PRECIO Y BOTÓN */}
        <div className="mt-auto flex items-end justify-between gap-1 border-t border-border/40 pt-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider leading-none">Precio</span>
            <span className={cn(
              "font-mono text-base md:text-lg font-black tracking-tight mt-0.5",
              isOutOfStock ? "text-muted-foreground/60 line-through" : "text-primary" // Tacha el precio si está agotado (opcional)
            )}>
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Button 
            size="icon"
            onClick={handleAdd} 
            disabled={isOutOfStock} // Deshabilita la interacción nativa
            className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-xl transition-all shadow-sm shrink-0",
              isOutOfStock 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary text-primary-foreground active:scale-90",
              isAnimating && "bg-emerald-500 hover:bg-emerald-500 text-white animate-pulse"
            )}
            aria-label={isOutOfStock ? `${product.name} agotado` : `Agregar ${product.name} al carrito`}
          >
            {isOutOfStock ? (
              <EyeOff className="h-4 w-4 stroke-[2]" />
            ) : isAnimating ? (
              <ShoppingBag className="h-4 w-4 animate-bounce" />
            ) : (
              <Plus className="h-4 w-4 stroke-[2.5]" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard;