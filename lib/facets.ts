export function buildFacets(products: Product[]) {
  const cat: Record<string, number> = {}
  const sub: Record<string, number> = {}
  const brand: Record<string, number> = {}

  for (const p of products) {
    const c = p.category?.level0
    const s = p.category?.level1
    const b = p.category?.level2

    if (c) cat[c] = (cat[c] || 0) + 1
    if (s) sub[s] = (sub[s] || 0) + 1
    if (b) brand[b] = (brand[b] || 0) + 1
  }

  return { cat, sub, brand }
}