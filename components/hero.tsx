import { Truck, ShieldCheck, MessageCircle } from "lucide-react"
import { storeConfig } from "@/lib/store-config"

export function Hero() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-card/30 to-background/50">
      
      {/* SECCIÓN DE COPYS ULTRA COMPACTA */}
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 md:py-10">
        <div className="max-w-2xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] md:text-xs font-semibold text-primary tracking-wide uppercase">
            <Truck className="h-3 w-3" />
            Envíos en {storeConfig.deliveryZone}
          </span>
          
          <h1 className="mt-3 font-display text-xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
            Tecnología a un mensaje de distancia
          </h1>
          
          <p className="mt-1.5 text-pretty text-xs md:text-base text-muted-foreground">
            Elegí tus productos, confirmá el pedido y coordinamos la entrega al instante por WhatsApp.
          </p>
        </div>
      </div>

      {/* CONTENEDOR HÍBRIDO */}
      <div className="relative flex w-full overflow-x-hidden border-t border-border bg-card/40 py-3 md:mx-auto md:max-w-6xl md:overflow-visible md:border-t-0 md:bg-transparent md:px-4 md:py-2">
        
        {/* PRIMER BLOQUE DE BENEFICIOS (Mobile: Marquee / Desktop: Grid) */}
        <div className="flex animate-marquee whitespace-nowrap gap-8 items-center shrink-0 min-w-full md:grid md:grid-cols-3 md:animate-none md:gap-4 md:min-w-0 md:w-full">
          <FeatureItem icon={<Truck className="h-3.5 w-3.5" />} title="Envío a domicilio" desc={`En ${storeConfig.deliveryZone}`} />
          <FeatureItem icon={<MessageCircle className="h-3.5 w-3.5" />} title="Pedido por WhatsApp" desc="Coordinación inmediata" />
          <FeatureItem icon={<ShieldCheck className="h-3.5 w-3.5" />} title="Pago 100% simple" desc="Efectivo o Transferencia" />
        </div>
        
        {/* SEGUNDO BLOQUE (CLON PARA MOBILE) */}
        <div className="flex animate-marquee whitespace-nowrap gap-8 items-center shrink-0 min-w-full md:hidden" aria-hidden="true">
          <FeatureItem icon={<Truck className="h-3.5 w-3.5" />} title="Envío a domicilio" desc={`En ${storeConfig.deliveryZone}`} />
          <FeatureItem icon={<MessageCircle className="h-3.5 w-3.5" />} title="Pedido por WhatsApp" desc="Coordinación inmediata" />
          <FeatureItem icon={<ShieldCheck className="h-3.5 w-3.5" />} title="Pago 100% simple" desc="Efectivo o Transferencia" />
        </div>
      </div>
    </section>
  )
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-2.5 text-foreground/90 select-none md:w-full md:rounded-xl md:border md:border-border md:bg-card/50 md:p-3.5 md:shadow-xs">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary md:h-8 md:w-8 md:rounded-lg">
        {icon}
      </span>
      <div className="flex items-center gap-1.5 md:flex-col md:items-start md:gap-0.5">
        <h3 className="text-xs font-bold tracking-tight text-foreground">{title}</h3>
        <span className="text-[11px] text-muted-foreground font-medium md:hidden">—</span>
        <p className="text-[11px] font-medium text-muted-foreground leading-none">{desc}</p>
      </div>
    </div>
  )
}

export default Hero;