import { Cpu, Truck } from "lucide-react"
import { storeConfig } from "@/lib/store-config"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cpu className="h-4 w-4" />
          </span>
          <span className="font-display font-bold">{storeConfig.name}</span>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="h-4 w-4" />
          Envíos únicamente dentro de {storeConfig.deliveryZone}
        </p>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {storeConfig.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
