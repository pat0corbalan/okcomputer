"use client"

import * as React from "react"
import { X, ShieldCheck, Truck, Zap } from "lucide-react"
import { formatPrice } from "@/lib/store-config"
import Image from "next/image"
import { type Product } from "@/lib/products"
import { createPortal } from "react-dom"

interface Props {
  product: Product | null | undefined
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailModal({ product, isOpen, onClose }: Props) {
  const imageUrl = React.useMemo(() => {
    if (!product) return null
    const BASE_URL = "/api/image"
    
    if (product.image) {
      return product.image.startsWith("http") 
        ? `${BASE_URL}/${product.image.replace("http://importcellsgo.ddns.net/tienda2/", "")}`
        : `${BASE_URL}/${product.image.replace(/^\//, "")}`
    }

    const mongoId = typeof product._id === "object" && product._id && "$oid" in product._id
      ? (product._id as any).$oid
      : product._id
    const identificador = product.sku || product.codigo_original || mongoId
    return identificador ? `${BASE_URL}/catalogo/${identificador}.jpg` : null
  }, [product])

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  if (!mounted || !isOpen || !product) return null

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-[#050810]/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#0a0f1d]/90 border border-white/[0.08] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-500" style={{ maxHeight: '85vh' }}>
        
        {/* Botón Cerrar Minimalista */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Lado Imagen: Estilo Galería */}
        <div className="w-full md:w-[50%] flex items-center justify-center p-12 bg-white/[0.02]">
          <div className="relative w-full aspect-square">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={product.name} 
                fill 
                className="object-contain" 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/5 text-[10px] font-black uppercase tracking-[0.3em]">No Preview</div>
            )}
          </div>
        </div>

        {/* Lado Contenido: Tipografía Refinada */}
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-[#0a0f1d]">
          <div className="space-y-6">
            {/* Categoría Discreta */}
            <span className="text-[10px] font-bold tracking-[0.2em] text-neon-cyan/70 uppercase">
              {(product.category as any)?.level0 || "Catálogo"}
            </span>

            {/* Nombre elegante, no gigante */}
            <h2 className="text-2xl md:text-3xl font-light text-white leading-snug tracking-tight">
              {product.name}
            </h2>
            
            {/* Precio Minimalista */}
            <div className="text-2xl font-semibold text-white font-mono">
              {formatPrice(product.price)}
            </div>

            {/* Descripción fina */}
            <p className="text-sm text-gray-500 leading-relaxed font-light max-w-sm">
              {product.description || "Un producto seleccionado por su calidad y rendimiento superior. Diseñado para ofrecer la mejor experiencia en su clase."}
            </p>

            {/* Detalles Rápidos (Iconos delicados) */}
            <div className="flex gap-8 pt-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Zap className="w-4 h-4 text-neon-cyan" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Premium</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Garantizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}