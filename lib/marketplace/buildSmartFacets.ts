export function buildSmartFacets(products: any[], query: string) {
  const intent = parseAIQuery(query)

  const categories: Record<string, number> = {}
  const brands: Record<string, number> = {}
  const types: Record<string, number> = {}

  for (const p of products) {
    const cat = p.category?.level0
    const type = p.category?.level1
    const brand = p.category?.level2

    if (cat) {
      categories[cat] = (categories[cat] || 0) + 1
    }

    if (type) {
      types[type] = (types[type] || 0) + 1
    }

    if (brand) {
      brands[brand] = (brands[brand] || 0) + 1
    }
  }

  // 🧠 RE-RANKING INTELIGENTE
  const sortByIntent = (obj: Record<string, number>, hint?: string) => {
    return Object.entries(obj).sort((a, b) => {
      const aMatch = hint && a[0].toLowerCase().includes(hint) ? 10 : 0
      const bMatch = hint && b[0].toLowerCase().includes(hint) ? 10 : 0

      return (b[1] + bMatch) - (a[1] + aMatch)
    })
  }

  return {
    categories: sortByIntent(categories, intent.categoryHint),
    types: sortByIntent(types, intent.typeHint),
    brands: sortByIntent(brands, intent.brandHint),
  }
}