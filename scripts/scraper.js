const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Configuración de Margen y Stock de Seguridad
const MARGEN_GANANCIA = 1.35; // Aplica tu 35% de ganancia
const COLCHON_STOCK = 2;       // Si el stock es <= 2, va 0 para dropshipping

async function ejecutarScraperPorInyeccion() {
  console.log('======================================================');
  console.log('🚀 INICIANDO EXTRACTOR NATIVO DE VARIABLE DATA');
  console.log('======================================================\n');

  const urlCatalogo = 'http://importcellsgo.ddns.net/tienda/catalogo.php?cat=149';
  let baseDeDatosUnificada = [];

  try {
    console.log(`📡 Descargando catálogo desde: ${urlCatalogo}...`);
    const respuesta = await axios.get(urlCatalogo, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(respuesta.data);
    let scriptContenido = '';

    // 1. Buscar el script que contiene la variable DATA
    $('script').each((i, el) => {
      const htmlInterno = $(el).html();
      if (htmlInterno && htmlInterno.includes('DATA')) {
        scriptContenido = htmlInterno;
      }
    });

    if (!scriptContenido) {
      console.log('❌ No se encontró la variable DATA dentro de los scripts.');
      return;
    }

    // 2. Extraer el bloque JSON usando una Expresión Regular limpia
    // Busca todo lo que esté entre "DATA =" y el cierre de la instrucción (] o ;)
    const regexData = /DATA\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/;
    const match = scriptContenido.match(regexData);

    if (!match || !match[1]) {
      console.log('❌ No se pudo aislar el formato del array DATA.');
      return;
    }

    // 3. Parsear el texto a un Array real de JavaScript
    const productosCrudos = JSON.parse(match[1]);
    console.log(`📦 Se detectaron ${productosCrudos.length} productos crudos en memoria. Procesando...`);

    // 4. Mapear y transformar los productos según tus reglas de negocio
    productosCrudos.forEach(p => {
      // Estructura habitual del objeto del proveedor basada en tu código anterior:
      // p.desc -> Descripción/Nombre
      // p.stock -> Cantidad disponible
      // p.p4 -> Precio base o mayorista
      // p.codigo -> Código de artículo
      // p.img -> URL de la imagen relativa
      // p.agot -> Booleano o flag de agotado

      if (p.desc && p.p4) {
        const stockTotal = parseInt(p.stock, 10) || 0;
        
        // Aplicar regla de dropshipping (colchón de seguridad)
        // Si el flag p.agot es verdadero o el stock es bajo, va 0
        let stockVenta = stockTotal <= COLCHON_STOCK ? 0 : stockTotal;
        if (p.agot) stockVenta = 0;

        const costoMayorista = parseFloat(p.p4) || 0;
        const precioVentaFinal = Math.round(costoMayorista * MARGEN_GANANCIA);

        // Generar un SKU único y amigable para las URLs de tu web
        const skuGenerado = p.codigo 
          ? p.codigo.toLowerCase().trim().replace(/[^a-z0-9]/g, '-') 
          : p.desc.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

        if (costoMayorista > 0) {
          baseDeDatosUnificada.push({
            sku: skuGenerado,
            codigo_original: p.codigo || null,
            nombre: p.desc,
            imagenCompleta: p.img ? `http://importcellsgo.ddns.net/tienda/${p.img}` : null,
            costo: costoMayorista,
            precioVenta: precioVentaFinal,
            stockReal: stockTotal,
            stockVenta: stockVenta,
            estaAgotado: !!p.agot,
            actualizadoEn: new Date().toISOString()
          });
        }
      }
    });

  } catch (error) {
    console.error('❌ Error general durante el scraping:', error.message);
    return;
  }

  // 5. Guardado final en disco
  console.log('\n======================================================');
  console.log('💾 ESCRIBIENDO BASE DE DATOS JSON...');
  console.log('======================================================');

  try {
    fs.writeFileSync(
      'catalogo_tienda_dropshipping.json', 
      JSON.stringify(baseDeDatosUnificada, null, 2), 
      'utf-8'
    );

    console.log(`\n🎉 ¡Sincronización Exitosa!`);
    console.log(`📊 Total de productos listos para tu base de datos: ${baseDeDatosUnificada.length}`);
    console.log(`📁 Archivo consolidado: "catalogo_tienda_dropshipping.json"\n`);
  } catch (err) {
    console.error('❌ No se pudo escribir el archivo JSON:', err.message);
  }
}

ejecutarScraperPorInyeccion();