"use client"

import { categories, type CategoryId } from "@/lib/products"
import { cn } from "@/lib/utils"

type CategoryFilterProps = {
  active: CategoryId | "all"
  onChange: (value: CategoryId | "all") => void
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const items: { id: CategoryId | "all"; name: string }[] = [
    { id: "all", name: "Todos" },
    ...categories,
  ]

  return (
    /* 
      - En mobile: fila única (flex-nowrap), scroll horizontal (overflow-x-auto) y rebote nativo (overscroll-x-contain).
      - El -mx-4 y px-4 (junto al padre en page.tsx) hacen que los botones lleguen al borde físico del celular al scrollear.
      - En desktop (md): vuelve a un comportamiento estándar sin scroll.
    */
    <div className="flex flex-nowrap md:flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none overscroll-x-contain -mx-4 px-4 md:mx-0 md:px-0">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            /* 
              - shrink-0: Evita que el celular "apriete" o deforme el texto del botón.
              - active:scale-95: Feedback táctil al presionarlo.
              - text-xs md:text-sm: Texto ligeramente más compacto y cómodo en móviles.
            */
            "rounded-full border px-4 py-1.5 text-xs md:text-sm font-medium transition-all shrink-0 select-none active:scale-95",
            active === item.id
              ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
              : "border-border bg-card text-muted-foreground hover:border-border active:bg-muted md:hover:border-primary/50 md:hover:text-foreground",
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  )
}