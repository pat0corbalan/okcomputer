export function parseAIQuery(query: string) {
  const q = query.toLowerCase()

  const intent = {
    categoryHint: null as string | null,
    brandHint: null as string | null,
    typeHint: null as string | null,
    priceLevel: "any",
  }

  // 🧠 CATEGORY INTENT
  if (q.includes("zapato") || q.includes("zapatilla")) {
    intent.categoryHint = "calzado"
  }

  if (q.includes("remera") || q.includes("camisa")) {
    intent.categoryHint = "ropa"
  }

  // 🧠 BRAND INTENT
  const brands = ["nike", "adidas", "puma", "apple"]
  for (const b of brands) {
    if (q.includes(b)) intent.brandHint = b
  }

  // 🧠 PRICE INTENT
  if (q.includes("barato") || q.includes("económico")) {
    intent.priceLevel = "low"
  }

  if (q.includes("premium") || q.includes("pro")) {
    intent.priceLevel = "high"
  }

  return intent
}