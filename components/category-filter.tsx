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
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            active === item.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  )
}
