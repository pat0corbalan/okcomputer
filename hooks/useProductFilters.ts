"use client"

import { useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Product } from "@/lib/products"

type Filters = {
  q: string
  cat: string
  sub: string
  brand: string
}

export function useProductFilters(products: Product[]) {
  const params = useSearchParams()
  const router = useRouter()

  // Extraemos los strings primitivos directamente. Los strings se comparan por valor, NO por referencia.
  const qParam = params.get("q") || ""
  const catParam = params.get("cat") || "all"
  const subParam = params.get("sub") || "all"
  const brandParam = params.get("brand") || "all"

  // Memorizamos el objeto de filtros para que no cambie de referencia a menos que cambie la URL
  const filters = useMemo<Filters>(() => ({
    q: qParam,
    cat: catParam,
    sub: subParam,
    brand: brandParam
  }), [qParam, catParam, subParam, brandParam])

  // Memorizamos la mutación para que la función sea siempre idéntica en memoria
  const setFilters = useCallback((patch: Partial<Filters>) => {
    const newParams = new URLSearchParams(window.location.search)

    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "all" || v === "") {
        newParams.delete(k)
      } else {
        newParams.set(k, v)
      }
    })

    // Usamos scroll: false para evitar saltos molestos de pantalla en dispositivos móviles
    router.push(`?${newParams.toString()}`, { scroll: false })
  }, [router])

  // FILTRADO INTELIGENTE: Depende de variables primitivas (strings). Adiós re-renders infinitos.
  const filtered = useMemo(() => {
    const searchStr = qParam.toLowerCase().trim()

    if (!searchStr && catParam === "all" && subParam === "all" && brandParam === "all") {
      return products
    }

    return products.filter((p) => {
      const matchesQ =
        !searchStr ||
        p.name?.toLowerCase().includes(searchStr) ||
        p.description?.toLowerCase().includes(searchStr) ||
        p.sku?.toLowerCase().includes(searchStr)

      const matchesCat =
        catParam === "all" || p.category?.level0 === catParam

      const matchesSub =
        subParam === "all" || p.category?.level1 === subParam

      const matchesBrand =
        brandParam === "all" || p.category?.level2 === brandParam

      return matchesQ && matchesCat && matchesSub && matchesBrand
    })
  }, [products, qParam, catParam, subParam, brandParam])

  return { filters, setFilters, filtered }
}