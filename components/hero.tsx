import { Truck, ShieldCheck, MessageCircle } from "lucide-react"
import { storeConfig } from "@/lib/store-config"

export function Hero() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-card/60 to-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Truck className="h-3.5 w-3.5" />
            Envíos en {storeConfig.deliveryZone}
          </span>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Tecnología para tu día a día, a un mensaje de distancia
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            {storeConfig.description} Elegí tus productos, confirmá el pedido y
            coordinamos la entrega por WhatsApp.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Feature
            icon={<Truck className="h-5 w-5" />}
            title="Envío a domicilio"
            desc={`Entregas dentro de ${storeConfig.deliveryZone}.`}
          />
          <Feature
            icon={<MessageCircle className="h-5 w-5" />}
            title="Pedido por WhatsApp"
            desc="Confirmás y te contactamos para coordinar."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Pago simple"
            desc="Transferencia bancaria o efectivo."
          />
        </div>
      </div>
    </section>
  )
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
