export function aiFilterProducts(products: any[], query: string) {
  const intent = parseAIQuery(query)

  return products
    .map((p) => {
      let score = 0

      const name = p.name?.toLowerCase() || ""
      const desc = p.description?.toLowerCase() || ""

      // 🔎 text match
      if (name.includes(query.toLowerCase())) score += 5
      if (desc.includes(query.toLowerCase())) score += 2

      // 🧠 category boost
      if (
        intent.categoryHint &&
        p.category?.level0?.toLowerCase().includes(intent.categoryHint)
      ) {
        score += 6
      }

      // 🏷️ brand boost
      if (
        intent.brandHint &&
        p.category?.level2?.toLowerCase().includes(intent.brandHint)
      ) {
        score += 8
      }

      // 💰 price logic (si tienes price)
      if (intent.priceLevel === "low" && p.price < 50) score += 3
      if (intent.priceLevel === "high" && p.price > 200) score += 3

      return { ...p, _score: score }
    })
    .sort((a, b) => b._score - a._score)
}