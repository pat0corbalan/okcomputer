"use client"

import Image from "next/image"
import { useRef } from "react"
import { Truck, ShieldCheck, MessageCircle, type LucideIcon } from "lucide-react"
import { storeConfig } from "@/lib/store-config"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0f1d] via-[#0a0f1d] to-background pt-4 pb-12 md:pt-6 md:pb-16 w-full perspective-[1200px]">
      
      {/* Grilla informática premium de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />
      
      {/* Destellos ambientales de alta fidelidad */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-full max-w-4xl rounded-full bg-[#ff9000]/3 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 -z-10 h-[500px] w-full max-w-4xl rounded-full bg-[#00f0ff]/3 blur-[140px] pointer-events-none" />

      {/* Contenedor Full Width real */}
      <div className="w-full px-4 md:px-6">
        
        {/* ENVOLTORIO CON EFECTO PARALLAX 3D E INCLINACIÓN SUAVE */}
        <div 
          ref={containerRef}
          style={{
            transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
            willChange: "transform"
          }}
          className="group relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-[#0d1527] shadow-[0_0_50px_-12px_rgba(0,240,255,0.15)] transition-all duration-300 ease-out select-none hover:shadow-[0_0_60px_-6px_rgba(0,240,255,0.3)] p-[3px]"
        >
          
          {/* Capas del neón dinámico con trazo largo que cambia de color */}
          <div className="absolute inset-[-300%] animate-[spin_8s_linear_infinite,change-color_16s_ease-in-out_infinite] bg-[conic-gradient(from_0deg,var(--neon-dynamic)_0%,var(--neon-dynamic)_30%,transparent_35%,transparent_100%)] opacity-100 group-hover:animate-[spin_4s_linear_infinite,change-color_16s_ease-in-out_infinite] transition-all duration-500 pointer-events-none" />
          <div className="absolute inset-[-300%] animate-[spin_8s_linear_infinite,change-color_16s_ease-in-out_infinite] bg-[conic-gradient(from_0deg,var(--neon-dynamic)_0%,var(--neon-dynamic)_30%,transparent_35%,transparent_100%)] opacity-60 blur-md group-hover:animate-[spin_4s_linear_infinite,change-color_16s_ease-in-out_infinite] transition-all duration-500 pointer-events-none" />
          
          {/* Contenedor interno aislado para la imagen */}
          <div className="relative w-full h-full rounded-[13px] overflow-hidden bg-[#0a0f1d] z-10">
            <Image 
              src="/hero-tienda.png"
              alt="OK Computer - Hardware y Servicio Técnico"
              fill
              priority
              sizes="100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
            
            {/* Textura Cyberpunk de Scanlines (Líneas de monitor CRT/Servidor) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40 mix-blend-overlay" />

            {/* Overlay estético de profundidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d]/30 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* CONTENEDOR DE BENEFICIOS EXTENDIDO */}
        <div className="w-full mt-10">
          {/* CONTENEDOR HÍBRIDO DE BENEFICIOS */}
          <div className="relative flex w-full overflow-x-hidden border border-white/5 bg-[#0d1527]/40 py-4 md:overflow-visible md:rounded-2xl md:px-6 md:py-4 md:backdrop-blur-md">
            
            {/* PRIMER BLOQUE DE BENEFICIOS (CON ANIMACIÓN TÉRMICA EN SECUENCIA) */}
            <div className="flex animate-marquee whitespace-nowrap gap-8 items-center shrink-0 min-w-full md:grid md:grid-cols-3 md:animate-none md:gap-6 md:min-w-0 md:w-full">
              <FeatureItem icon={Truck} title="Envío a domicilio" desc={`En ${storeConfig.deliveryZone}`} delayClass="[animation-delay:0s]" />
              <FeatureItem icon={MessageCircle} title="Pedido por WhatsApp" desc="Coordinación inmediata" delayClass="[animation-delay:2s]" />
              <FeatureItem icon={ShieldCheck} title="Pago 100% simple" desc="Efectivo o Transferencia" delayClass="[animation-delay:4s]" />
            </div>
            
            {/* SEGUNDO BLOQUE (CLON PARA MOBILE MARQUEE) */}
            <div className="flex animate-marquee whitespace-nowrap gap-8 items-center shrink-0 min-w-full md:hidden" aria-hidden="true">
              <FeatureItem icon={Truck} title="Envío a domicilio" desc={`En ${storeConfig.deliveryZone}`} delayClass="[animation-delay:0s]" />
              <FeatureItem icon={MessageCircle} title="Pedido por WhatsApp" desc="Coordinación inmediata" delayClass="[animation-delay:2s]" />
              <FeatureItem icon={ShieldCheck} title="Pago 100% simple" desc="Efectivo o Transferencia" delayClass="[animation-delay:4s]" />
            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}

interface FeatureItemProps {
  icon: LucideIcon
  title: string
  desc: string
  delayClass: string
}

function FeatureItem({ icon: Icon, title, desc, delayClass }: FeatureItemProps) {
  return (
    <div className={`relative flex items-center gap-4 text-gray-200 select-none md:w-full md:rounded-xl md:border md:border-white/5 md:bg-[#0d1527]/60 md:p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[#0d1527] hover:border-[#00f0ff]/30 hover:shadow-[0_10px_30px_-10px_rgba(0,240,255,0.15)] group/item overflow-hidden`}>
      
      {/* Línea de circuito de pulso térmico ambiental */}
      <div className={`absolute top-0 left-0 h-[1px] w-1/3 bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent animate-[circuit-pulse_6s_linear_infinite] ${delayClass} group-hover/item:opacity-0 pointer-events-none`} />

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff9000]/10 text-[#ff9000] border border-[#ff9000]/10 transition-all duration-300 group-hover/item:bg-[#ff9000] group-hover/item:text-[#0a0f1d] group-hover/item:shadow-[0_0_15px_rgba(255,144,0,0.4)] z-10">
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      </span>
      <div className="flex items-center gap-1.5 md:flex-col md:items-start md:gap-0.5 z-10">
        <h3 className="text-xs font-bold tracking-tight text-white md:text-sm">{title}</h3>
        <span className="text-[11px] text-gray-400 font-medium md:hidden">—</span>
        <p className="text-[11px] font-medium text-gray-400 leading-none md:text-xs">{desc}</p>
      </div>
    </div>
  )
}

export default Hero;