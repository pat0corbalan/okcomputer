import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// Configuraciones del negocio de Dropshipping
const MARGEN_GANANCIA = 1.35; // 35% de ganancia
const COLCHON_STOCK = 2;       // Colchón de seguridad para evitar quiebres de stock

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Validar seguridad mediante Token por Header de Autorización
  const authHeader = request.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
    return NextResponse.json(
      { error: "No autorizado. Token inválido o ausente." },
      { status: 401 }
    );
  }

  const urlCatalogo = "http://importcellsgo.ddns.net/tienda/catalogo.php?cat=149";
  let productosAInsertar: any[] = [];

  try {
    // 2. Descargar el catálogo del proveedor externo
    const respuesta = await axios.get(urlCatalogo, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" 
      },
      timeout: 15000
    });

    const $ = cheerio.load(respuesta.data);
    let scriptContenido = "";

    $("script").each((_, el) => {
      const htmlInterno = $(el).html();
      if (htmlInterno && htmlInterno.includes("DATA")) {
        scriptContenido = htmlInterno;
      }
    });

    if (!scriptContenido) {
      return NextResponse.json({ error: "No se encontró la variable DATA en el catálogo del proveedor" }, { status: 500 });
    }

    const regexData = /DATA\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/;
    const match = scriptContenido.match(regexData);

    if (!match || !match[1]) {
      return NextResponse.json({ error: "No se pudo parsear el formato del array DATA" }, { status: 500 });
    }

    const productosCrudos = JSON.parse(match[1]);

    // 3. Procesar y limpiar datos según tus reglas de dropshipping
    productosCrudos.forEach((p: any) => {
      if (p.desc && p.p4) {
        const stockTotal = parseInt(p.stock, 10) || 0;
        let stockVenta = stockTotal <= COLCHON_STOCK ? 0 : stockTotal;
        if (p.agot) stockVenta = 0;

        const costoMayorista = parseFloat(p.p4) || 0;
        const precioVentaFinal = Math.round(costoMayorista * MARGEN_GANANCIA);

        const skuGenerado = p.codigo 
          ? p.codigo.toLowerCase().trim().replace(/[^a-z0-9]/g, "-") 
          : p.desc.toLowerCase().trim().replace(/[^a-z0-9]/g, "-");

        if (costoMayorista > 0) {
          productosAInsertar.push({
            sku: skuGenerado,
            codigo_original: p.codigo || null,
            name: p.desc,
            description: `Accesorio de alta calidad. Código de producto original: ${p.codigo || 'S/N'}.`,
            image: p.img ? `tienda/${p.img}` : null,
            price: precioVentaFinal,
            category: "Accesorios de Celulares",
            stock: stockVenta,
            costo: costoMayorista,
            actualizadoEn: new Date()
          });
        }
      }
    });

    // 4. Conectar a MongoDB vía Mongoose y sincronizar la colección
    await connectDB();

    // Vaciamos la colección anterior para refrescar stock y precios reales
    await Product.deleteMany({});
    
    // Insertamos el lote nuevo de forma masiva
    if (productosAInsertar.length > 0) {
      await Product.insertMany(productosAInsertar);
    }

    return NextResponse.json({
      success: true,
      message: "Catálogo sincronizado correctamente en MongoDB",
      total_productos: productosAInsertar.length,
      ejecutadoEn: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error crítico durante la sincronización", detalles: error.message },
      { status: 500 }
    );
  }
}