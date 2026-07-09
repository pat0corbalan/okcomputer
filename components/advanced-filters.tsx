"use client"

import { useMemo, useState, useRef, useTransition, useEffect } from "react"
import { type Product } from "@/lib/products"
import { ChevronDown, RotateCcw, SlidersHorizontal, X, Loader2 } from "lucide-react"
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
  isLoading?: boolean // Muestra el overlay borroso
}

function Section({ title, open, onToggle, children, isLoading }: SectionProps) {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-900 py-3 relative">
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
          "grid transition-all duration-200 ease-out overflow-hidden relative",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden space-y-1 relative min-h-[40px]">
          {children}

          {/* LOADING BORROSO LOCALIZADO SOBRE LOS CHIPS */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md transition-all animate-in fade-in duration-150">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-150">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-950 dark:text-zinc-50" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Cargando...
                </span>
              </div>
            </div>
          )}
        </div>
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
  const [isPending, startTransition] = useTransition()
  const [loadingSection, setLoadingSection] = useState<"cat" | "sub" | "brand" | "all" | null>(null)
  
  // Flag interno para saber qué sección debe abrirse y deslizarse tras la carga
  const [pendingNavigation, setPendingNavigation] = useState<"sub" | "brand" | null>(null)

  const [open, setOpen] = useState({
    cat: true,
    sub: false,
    brand: false,
  })

  const [search, setSearch] = useState({
    cat: "",
    sub: "",
    brand: "",
  })

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

  // EFECTO EFICAZ: Primero muestra loading, cuando termina la carga, abre el acordeón y se desliza.
  useEffect(() => {
    if (!isPending && pendingNavigation) {
      const target = pendingNavigation
      setPendingNavigation(null)
      setLoadingSection(null)

      if (target === "sub") {
        setOpen({ cat: false, sub: true, brand: false })
        setTimeout(() => {
          subSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }, 50)
      } else if (target === "brand") {
        setOpen({ cat: false, sub: false, brand: true })
        setTimeout(() => {
          brandSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }, 50)
      }
    }
  }, [isPending, pendingNavigation])

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
    setLoadingSection("all")
    startTransition(() => {
      onReset()
    })
    setSearch({ cat: "", sub: "", brand: "" })
    setOpen({ cat: true, sub: false, brand: false })
  }

  const handleCategorySelect = (category: string) => {
    const isRemoving = selectedCategory === category
    
    if (!isRemoving) {
      setLoadingSection("cat") // Muestra loading en la sección actual
      setPendingNavigation("sub") // Al terminar, navega a Tipo
    } else {
      setLoadingSection("all")
    }

    startTransition(() => {
      onCategoryChange(isRemoving ? "all" : category)
    })
  }

  const handleSubcategorySelect = (subcat: string) => {
    const isRemoving = selectedSubcategory === subcat
    
    if (!isRemoving) {
      setLoadingSection("sub") // Muestra loading en la sección actual
      setPendingNavigation("brand") // Al terminar, navega a Marca
    } else {
      setLoadingSection("all")
    }

    startTransition(() => {
      onSubcategoryChange(isRemoving ? "all" : subcat)
    })
  }

  const handleBrandSelect = (brand: string) => {
    const isRemoving = selectedBrand === brand
    setLoadingSection(isRemoving ? "all" : "brand")
    
    startTransition(() => {
      onBrandChange(isRemoving ? "all" : brand)
    })
  }

  /* ----------------------------- ACTIVE CHIPS ----------------------------- */

  const ActiveFilters = () => {
    const items = [
      selectedCategory !== "all" && {
        label: selectedCategory,
        onRemove: () => { setLoadingSection("all"); startTransition(() => onCategoryChange("all")) },
      },
      selectedSubcategory !== "all" && {
        label: selectedSubcategory,
        onRemove: () => { setLoadingSection("all"); startTransition(() => onSubcategoryChange("all")) },
      },
      selectedBrand !== "all" && {
        label: selectedBrand,
        onRemove: () => { setLoadingSection("all"); startTransition(() => onBrandChange("all")) },
      },
    ].filter(Boolean) as { label: string; onRemove: () => void }[]

    if (!items.length) return null

    return (
      <div className="flex flex-wrap gap-2 pb-3">
        {items.map((i) => (
          <button
            key={i.label}
            onClick={i.onRemove}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shadow-sm"
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
    <div className="w-full h-full max-h-[80vh] md:max-h-none overflow-y-auto pr-1 space-y-3 scroll-smooth relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 sticky top-0 bg-white dark:bg-zinc-950 z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <ActiveFilters />

      <div className="relative space-y-3">
        
        {/* CATEGORY */}
        <div>
          <Section
            title="Categoría"
            open={open.cat}
            onToggle={() => setOpen((s) => ({ ...s, cat: !s.cat }))}
            isLoading={isPending && (loadingSection === "cat" || loadingSection === "all")}
          >
            <input
              value={search.cat}
              onChange={(e) => setSearch((s) => ({ ...s, cat: e.target.value }))}
              placeholder="Buscar categoría..."
              className="w-full mb-2 px-3 py-2 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 outline-none"
            />

            <div className="space-y-1">
              {filterList(data.categories, search.cat).map(([k, v]) => (
                <Chip
                  key={k}
                  label={k}
                  count={v}
                  active={selectedCategory === k}
                  onClick={() => handleCategorySelect(k)}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* SUBCATEGORY (Tipo) */}
        <div ref={subSectionRef}>
          <Section
            title="Tipo"
            open={open.sub}
            onToggle={() => setOpen((s) => ({ ...s, sub: !s.sub }))}
            isLoading={isPending && (loadingSection === "sub" || loadingSection === "all")}
          >
            <input
              value={search.sub}
              onChange={(e) => setSearch((s) => ({ ...s, sub: e.target.value }))}
              placeholder="Buscar tipo..."
              className="w-full mb-2 px-3 py-2 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 outline-none"
            />

            <div className="space-y-1">
              {filterList(data.subcategories, search.sub).map(([k, v]) => (
                <Chip
                  key={k}
                  label={k}
                  count={v}
                  active={selectedSubcategory === k}
                  onClick={() => handleSubcategorySelect(k)}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* BRAND */}
        <div ref={brandSectionRef}>
          <Section
            title="Marca / Modelo"
            open={open.brand}
            onToggle={() => setOpen((s) => ({ ...s, brand: !s.brand }))}
            isLoading={isPending && (loadingSection === "brand" || loadingSection === "all")}
          >
            <input
              value={search.brand}
              onChange={(e) => setSearch((s) => ({ ...s, brand: e.target.value }))}
              placeholder="Buscar marca..."
              className="w-full mb-2 px-3 py-2 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 outline-none"
            />

            <div className="space-y-1">
              {filterList(data.brands, search.brand).map(([k, v]) => (
                <Chip
                  key={k}
                  label={k}
                  count={v}
                  active={selectedBrand === k}
                  onClick={() => handleBrandSelect(k)}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* OVERLAY GLOBAL AL LIMPIAR TODO */}
        {isPending && loadingSection === "all" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-150 rounded-xl" />
        )}
      </div>
    </div>
  )
}