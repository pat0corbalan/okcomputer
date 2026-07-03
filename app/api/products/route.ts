import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// 🔥 ESTA ES LA LÍNEA CLAVE: Fuerza a Next.js a ejecutar la consulta a Mongo 
// en tiempo real en cada recarga, sin guardar nada en caché.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Trae los datos frescos directamente de tu MongoDB
    const products = await Product.find({ stock: { $gt: 0 } }).lean();

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error en el servidor al obtener el catálogo", details: error.message },
      { status: 500 }
    );
  }
}