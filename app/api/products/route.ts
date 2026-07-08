import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

// 🔥 Fuerza a Next.js a ejecutar la consulta a Mongo en tiempo real en cada recarga
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Conectamos a la base de datos
    await connectDB();

    // 2. Traemos TODOS los productos sin filtros para descartar que sea un tema de stock cero.
    // Usamos .lean() para que devuelva objetos JS planos y sea más rápido.
    const products = await Product.find({}).lean();


    // 3. Devolvemos la respuesta
    return NextResponse.json(products);
    
  } catch (error: any) {
    
    return NextResponse.json(
      { error: "Error en el servidor al obtener el catálogo", details: error.message },
      { status: 500 }
    );
  }
}