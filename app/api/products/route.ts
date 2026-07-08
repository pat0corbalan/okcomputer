import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // 💡 ULTRA-OPTIMIZACIÓN: 
    // Seleccionamos SOLO los campos que la grilla de productos y filtros necesitan.
    // Al recortar la payload de red, la respuesta pasa de tardar segundos a ~100ms.
    const products = await Product.find({})
      .select("sku name image price stock category categories codigo_original description")
      .lean();

    return NextResponse.json(products);
    
  } catch (error: any) {
    console.error("❌ Error API GET /api/products:", error);
    return NextResponse.json(
      { error: "Error en el servidor al obtener el catálogo", details: error.message },
      { status: 500 }
    );
  }
}