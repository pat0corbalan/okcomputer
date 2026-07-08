"use client"

import { useMemo, useState } from "react"
import { aiFilterProducts } from "@/lib/marketplace/aiFilterProducts"
import { buildSmartFacets } from "@/lib/marketplace/buildSmartFacets"

export function useAIMarketplace(products: any[], search: string) {
  const filtered = useMemo(() => {
    return aiFilterProducts(products, search)
  }, [products, search])

  const facets = useMemo(() => {
    return buildSmartFacets(filtered, search)
  }, [filtered, search])

  return {
    filtered,
    facets,
  }
}