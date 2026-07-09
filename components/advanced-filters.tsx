"use client"

import { useMemo, useState, useRef } from "react"
import { type Product } from "@/lib/products"
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  products: Product[]
  selectedCategory: string | "all"
  onCategoryChange: (v: string | "all") => void

  selectedSubcategory: string | "all"
  onSubcategoryChange: (v: string | "all") => void

  selectedBrand: string | "all"
  onBrandChange: (v: string | "all") => void

  onReset: () => void
}

/* ----------------------------- UI ATOMS ----------------------------- */

function Chip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all active:scale-[0.99]",
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-semibold"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
      )}
    >
      <span className="truncate">{label}</span>
      <span className="text-[10px] opacity-60 font-mono">{count}</span>
    </button>
  )
}

interface SectionProps {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ title, open, onToggle, children }: SectionProps) {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-900 py-3">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between mb-2"
      >
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out overflow-hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden space-y-1">{children}</div>
      </div>
    </div>
  )
}

/* ----------------------------- MAIN ----------------------------- */

export function AdvancedFilters({
  products,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  selectedBrand,
  onBrandChange,
  onReset,
}: Props) {
  const [open, setOpen] = useState({
    cat: true,
    sub: false, // Empezamos con sub y brand cerrados para un look limpio
    brand: false,
  })

  const [search, setSearch] = useState({
    cat: "",
    sub: "",
    brand: "",
  })

  // Referencias para hacer scroll automático fluido
  const subSectionRef = useRef<HTMLDivElement>(null)
  const brandSectionRef = useRef<HTMLDivElement>(null)

  // 1. Filtrado cruzado inteligente
  const filteredProductsForOptions = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category?.level0 === selectedCategory
      const matchSub = selectedSubcategory === "all" || p.category?.level1 === selectedSubcategory
      const matchBrand = selectedBrand === "all" || p.category?.level2 === selectedBrand

      return matchCat && matchSub && matchBrand
    })
  }, [products, selectedCategory, selectedSubcategory, selectedBrand])

  // 2. Generación de opciones dependientes
  const data = useMemo(() => {
    const categories: Record<string, number> = {}
    const subcategories: Record<string, number> = {}
    const brands: Record<string, number> = {}

    for (const p of products) {
      const c = p.category?.level0 || "Otros"
      categories[c] = (categories[c] || 0) + 1
    }

    for (const p of filteredProductsForOptions) {
      const s = p.category?.level1
      const b = p.category?.level2

      if (s) subcategories[s] = (subcategories[s] || 0) + 1
      if (b) brands[b] = (brands[b] || 0) + 1
    }

    return { categories, subcategories, brands }
  }, [products, filteredProductsForOptions])

  const hasFilters =
    selectedCategory !== "all" ||
    selectedSubcategory !== "all" ||
    selectedBrand !== "all"

  const filterList = (obj: Record<string, number>, q: string) => {
    return Object.entries(obj)
      .filter(([k]) => k.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
  }

  const clearAll = () => {
    onReset()
    setSearch({ cat: "", sub: "", brand: "" })
    setOpen({ cat: true, sub: false, brand: false })
  }

  // Manejadores con auto-avance secuencial
  const handleCategorySelect = (category: string) => {
    const isRemoving = selectedCategory === category
    onCategoryChange(isRemoving ? "all" : category)

    if (!isRemoving) {
      // Abrimos Tipo, cerramos Categoría (opcional, limpia la pantalla), y hacemos scroll
      setOpen({ cat: false, sub: true, brand: false })
      setTimeout(() => {
        subSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 100)
    }
  }

  const handleSubcategorySelect = (subcat: string) => {
    const isRemoving = selectedSubcategory === subcat
    onSubcategoryChange(isRemoving ? "all" : subcat)

    if (!isRemoving) {
      // Abrimos Marca, cerramos Tipo
      setOpen({ cat: false, sub: false, brand: true })
      setTimeout(() => {
        brandSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 100)
    }
  }

  /* ----------------------------- ACTIVE CHIPS ----------------------------- */

  const ActiveFilters = () => {
    const items = [
      selectedCategory !== "all" && {
        label: selectedCategory,
        onRemove: () => onCategoryChange("all"),
      },
      selectedSubcategory !== "all" && {
        label: selectedSubcategory,
        onRemove: () => onSubcategoryChange("all"),
      },
      selectedBrand !== "all" && {
        label: selectedBrand,
        onRemove: () => onBrandChange("all"),
      },
    ].filter(Boolean) as { label: string; onRemove: () => void }[]

    if (!items.length) return null

    return (
      <div className="flex flex-wrap gap-2 pb-3">
        {items.map((i) => (
          <button
            key={i.label}
            onClick={i.onRemove}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            {i.label}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>
    )
  }

  /* ----------------------------- RENDER ----------------------------- */

  return (
    <div className="w-full h-full max-h-[80vh] md:max-h-none overflow-y-auto pr-1 space-y-3 scroll-smooth">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 sticky top-0 bg-white dark:bg-zinc-950 z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <ActiveFilters />

      {/* CATEGORY */}
      <div>
        <Section
          title="Categoría"
          open={open.cat}
          onToggle={() => setOpen((s) => ({ ...s, cat: !s.cat }))}
        >
          <input
            value={search.cat}
            onChange={(e) => setSearch((s) => ({ ...s, cat: e.target.value }))}
            placeholder="Buscar categoría..."
            className="w-full mb-2 px-3 py-2 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 outline-none"
          />

          {filterList(data.categories, search.cat).map(([k, v]) => (
            <Chip
              key={k}
              label={k}
              count={v}
              active={selectedCategory === k}
              onClick={() => handleCategorySelect(k)}
            />
          ))}
        </Section>
      </div>

      {/* SUBCATEGORY */}
      <div ref={subSectionRef}>
        <Section
          title="Tipo"
          open={open.sub}
          onToggle={() => setOpen((s) => ({ ...s, sub: !s.sub }))}
        >
          <input
            value={search.sub}
            onChange={(e) => setSearch((s) => ({ ...s, sub: e.target.value }))}
            placeholder="Buscar tipo..."
            className="w-full mb-2 px-3 py-2 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 outline-none"
          />

          {filterList(data.subcategories, search.sub).map(([k, v]) => (
            <Chip
              key={k}
              label={k}
              count={v}
              active={selectedSubcategory === k}
              onClick={() => handleSubcategorySelect(k)}
            />
          ))}
        </Section>
      </div>

      {/* BRAND */}
      <div ref={brandSectionRef}>
        <Section
          title="Marca / Modelo"
          open={open.brand}
          onToggle={() => setOpen((s) => ({ ...s, brand: !s.brand }))}
        >
          <input
            value={search.brand}
            onChange={(e) => setSearch((s) => ({ ...s, brand: e.target.value }))}
            placeholder="Buscar marca..."
            className="w-full mb-2 px-3 py-2 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 outline-none"
          />

          {filterList(data.brands, search.brand).map(([k, v]) => (
            <Chip
              key={k}
              label={k}
              count={v}
              active={selectedBrand === k}
              onClick={() => onBrandChange(selectedBrand === k ? "all" : k)}
            />
          ))}
        </Section>
      </div>
    </div>
  )
}