"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, MessageCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { formatPrice, storeConfig } from "@/lib/store-config"

export default function OrderSentPage() {
  const [order, setOrder] = useState<{ name: string; total: number } | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("okcomputer-last-order")
      if (raw) setOrder(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-9 w-9" />
        </span>

        <h1 className="mt-6 text-balance font-display text-3xl font-bold">
          ¡Pedido enviado correctamente!
        </h1>

        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          {order?.name ? `Gracias, ${order.name}. ` : ""}
          Recibimos tu pedido y te vamos a contactar por WhatsApp para coordinar la
          entrega dentro de {storeConfig.deliveryZone}.
        </p>

        {order?.total ? (
          <div className="mt-6 w-full rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total del pedido</span>
              <span className="font-display text-xl font-bold text-primary">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4 text-left">
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Si WhatsApp no se abrió automáticamente, revisá tu pestaña de mensajes.
            El detalle de tu pedido ya está listo para enviar a la tienda.
          </p>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <MessageCircle className="h-5 w-5" />
              Seguir comprando
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
