// app/page.tsx (Server Component con consulta directa a DB)
import { Suspense } from "react"
import { HomeClient } from "@/app/home-client"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { Loader2 } from "lucide-react"

export const revalidate = 0 // Fuerza contenido dinámico

async function getProductsDirectly() {
  try {
    // 1. Conectamos directamente a Mongo sin pasar por la API HTTP
    await connectDB()

    // 2. Traemos solo los datos esenciales optimizados y planos con .lean()
    const rawProducts = await Product.find({})
      .select("sku codigo_original name description image price stock category categories")
      .lean()

    // 3. Sanitización: Mongoose devuelve objetos con formatos especiales como _id: ObjectId o fechas.
    // Lo transformamos a JSON plano y seguro para que no dé errores al pasar de Servidor a Cliente.
    return JSON.parse(JSON.stringify(rawProducts))
  } catch (error) {
    console.error("⚠️ Error leyendo la base de datos directamente en el servidor:", error)
    return []
  }
}

export default async function Page() {
  // La consulta ocurre directo en memoria del servidor (Ultra Veloz ⚡)
  const products = await getProductsDirectly()

  return (
    <Suspense fallback={
      // Cambiado bg-zinc-950 por bg-background (azul noche) y text-zinc-50 por text-neon-cyan (cian eléctrico)
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
      </div>
    }>
      <HomeClient initialProducts={products} />
    </Suspense>
  )
}