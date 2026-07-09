"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Plus, ImageOff, EyeOff, Check, ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/store-config"
import { getCategoryName, type Product } from "@/lib/products"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ProductDetailModal } from "@/components/product/product-detail-modal"

type ProductCardProps = {
  product: Product
  className?: string
  index?: number
  onClick: () => void
}

const BASE_URL = "/api/image"

export function ProductCard({ product, className, index, onClick }: ProductCardProps) {
  const { addItem } = useCart()
  const [isAnimating, setIsAnimating] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isOutOfStock = useMemo(() => !!(product.agot || product.stock === 0), [product.agot, product.stock])
  const isPriority = useMemo(() => index !== undefined && index < 4, [index])

  // Lógica UX: Validar si la descripción es útil o es una copia del nombre
  const displayDescription = useMemo(() => {
    if (!product.description) return null
    
    // Normalizamos los textos para compararlos (quitamos espacios y pasamos a minúsculas)
    const cleanName = product.name.trim().toLowerCase()
    const cleanDesc = product.description.trim().toLowerCase()

    // Si son idénticos o la descripción no aporta valor real, no la renderizamos
    if (cleanDesc === cleanName || cleanDesc.startsWith(cleanName.substring(0, 20))) {
      return null
    }

    return product.description
  }, [product.name, product.description])

  const imageUrl = useMemo(() => {
    if (!product.image) {
      const mongoId = typeof product._id === "object" && product._id && "$oid" in product._id
        ? (product._id as any).$oid
        : product._id

      const identificador = product.sku || product.codigo_original || mongoId

      return identificador ? `${BASE_URL}/catalogo/${identificador}.jpg` : null
    }

    if (product.image.startsWith("http")) {
      return `${BASE_URL}/${product.image.replace("http://importcellsgo.ddns.net/tienda2/", "")}`
    }

    return `${BASE_URL}/${product.image.replace(/^\//, "")}`
  }, [product.image, product._id, product.sku, product.codigo_original])

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()

    if (isOutOfStock || isAnimating) return

    setIsAnimating(true)
    addItem(product, 1)

    toast.custom((id) => (
      <div
        className={cn(
          "flex items-center gap-3 w-full max-w-md p-3 rounded-xl border border-emerald-500/30 bg-[#0d1527]/90 backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.1)] transition-all duration-300 pointer-events-auto",
          "animate-in fade-in slide-in-from-bottom-4"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShoppingCart className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white tracking-wide uppercase">
            ¡Agregado al carrito!
          </p>

          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            {product.name}
          </p>
        </div>

        <button
          onClick={() => toast.dismiss(id)}
          className="text-[10px] font-mono font-bold tracking-wider text-gray-500 hover:text-white transition-colors px-2 py-1 uppercase"
        >
          X
        </button>
      </div>
    ), {
      position: "bottom-center",
      duration: 3000
    })

    setTimeout(() => setIsAnimating(false), 1200)
  }

  return (
    <>
      <motion.div
       onClick={onClick}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index ? Math.min(index * 0.05, 0.3) : 0,
          ease: "easeOut"
        }}
        whileHover={!isOutOfStock ? { y: -4 } : {}}
        className={cn(
          "group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-[#0d1527]/40 backdrop-blur-md transition-colors duration-300 will-change-transform",
          "hover:border-neon-cyan/40 hover:shadow-[0_0_30px_rgba(0,240,255,0.08)]",
          "h-full",
          isOutOfStock && "opacity-50 hover:border-white/5 hover:shadow-none",
          className
        )}
      >
        {/* Contenedor de Imagen */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-white/[0.01] flex items-center justify-center border-b border-white/5">
          {!imageUrl || imageError ? (
            <div className="flex flex-col items-center justify-center gap-1.5 text-gray-500/70">
              <ImageOff className="h-8 w-8 stroke-[1.2]" />
              <span className="text-[9px] uppercase tracking-wider font-semibold">Sin imagen</span>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-w-640px) 50vw, (max-w-1024px) 33vw, 250px"
              className={cn(
                "object-contain p-4 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                !isOutOfStock && "group-hover:scale-105",
                isOutOfStock && "grayscale opacity-40"
              )}
              onError={() => setImageError(true)}
              priority={isPriority}
            />
          )}

          <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center pointer-events-none">
            <span className="rounded-md bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 text-[9px] font-bold text-neon-cyan uppercase tracking-wider backdrop-blur-md">
              {getCategoryName(product.category.id)}
            </span>
            {isOutOfStock && (
              <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase tracking-wider backdrop-blur-md">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Contenedor de Información */}
        <div className="flex flex-1 flex-col p-3 md:p-4 justify-between gap-2.5 bg-gradient-to-b from-transparent to-[#0a0f1d]/20">
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="text-balance text-xs md:text-sm font-bold leading-snug text-gray-200 tracking-tight line-clamp-2 min-h-[2.5rem] mb-1">
              {product.name}
            </h3>
            {displayDescription && (
              <p className="hidden md:line-clamp-2 text-[11px] text-gray-400/70 leading-relaxed min-h-[2rem]">
                {displayDescription}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-2.5">
            <div className="flex flex-col">
              <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider leading-none">Precio</span>
              <span className={cn(
                "font-mono text-base md:text-lg font-black tracking-tight mt-0.5 transition-colors",
                isOutOfStock ? "text-gray-600 line-through" : "text-neon-orange group-hover:text-amber-400"
              )}>
                {formatPrice(product.price)}
              </span>
            </div>

            <Button
              size="icon"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="h-9 w-9 md:h-10 md:w-10 rounded-xl shrink-0"
            >
              <AnimatePresence mode="wait">
                {isOutOfStock ? <EyeOff className="h-4 w-4" /> : isAnimating ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default ProductCard