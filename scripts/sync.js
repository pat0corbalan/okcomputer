const axios = require('axios');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const path = require('path');

// Configura dotenv para leer las variables de entorno desde el .env.local de Next.js
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Configuración de Margen y Stock de Seguridad para tu Dropshipping
const MARGEN_GANANCIA = 1.35; // Aplica tu 35% de ganancia
const COLCHON_STOCK = 2;       // Si el stock es <= 2, va 0 para no vender sin stock real

// Traemos la URI segura desde el archivo .env.local
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = "okcomputer"; // Nombre de tu base de datos unificada

async function sincronizarConMongoDB() {
  console.log('======================================================');
  console.log('🚀 INICIANDO SCRAPER E INYECCIÓN SEGURA A MONGO DB');
  console.log('======================================================\n');

  // Validación de seguridad inicial
  if (!MONGO_URI) {
    console.error('❌ Error crítico: MONGODB_URI no está definida en tu archivo .env.local');
    console.error('Por favor, verifica la ruta del archivo o las variables de entorno.\n');
    return;
  }

  const urlCatalogo = 'http://importcellsgo.ddns.net/tienda/catalogo.php?cat=149';
  let productosAInsertar = [];
  const client = new MongoClient(MONGO_URI);

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
      console.log('❌ No se encontró la variable DATA dentro de los scripts del proveedor.');
      return;
    }

    // 2. Extraer el bloque JSON usando la Expresión Regular
    const regexData = /DATA\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/;
    const match = scriptContenido.match(regexData);

    if (!match || !match[1]) {
      console.log('❌ No se pudo aislar el formato del array DATA.');
      return;
    }

    // 3. Parsear el texto a un Array real de JavaScript
    const productosCrudos = JSON.parse(match[1]);
    console.log(`📦 Se detectaron ${productosCrudos.length} productos crudos en el servidor externo. Procesando...`);

    // 4. Mapear y transformar los productos según tus reglas de negocio
    productosCrudos.forEach(p => {
      if (p.desc && p.p4) {
        const stockTotal = parseInt(p.stock, 10) || 0;
        
        // Aplicar regla de dropshipping (colchón de seguridad)
        let stockVenta = stockTotal <= COLCHON_STOCK ? 0 : stockTotal;
        if (p.agot) stockVenta = 0;

        const costoMayorista = parseFloat(p.p4) || 0;
        const precioVentaFinal = Math.round(costoMayorista * MARGEN_GANANCIA);

        // Generar un SKU único y limpio para las URLs de tu web
        const skuGenerado = p.codigo 
          ? p.codigo.toLowerCase().trim().replace(/[^a-z0-9]/g, '-') 
          : p.desc.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

        // Unificamos la categoría para tu tienda online
        const categoriaUnificada = "Accesorios de Celulares";

        if (costoMayorista > 0) {
          productosAInsertar.push({
            sku: skuGenerado,
            codigo_original: p.codigo || null,
            name: p.desc, // Mapeado a 'name' para coincidir con tu Frontend
            description: `Accesorio de alta calidad. Código de producto original: ${p.codigo || 'S/N'}.`,
            image: p.img ? `tienda/${p.img}` : null, // Guardamos la ruta relativa limpia
            price: precioVentaFinal, // Precio con el 35% aplicado
            category: categoriaUnificada,
            stock: stockVenta, // Stock real depurado con el colchón
            costo: costoMayorista,
            actualizadoEn: new Date()
          });
        }
      }
    });

    // 5. Conexión e inserción masiva en MongoDB Atlas
    console.log('\n🔌 Conectando de forma segura a MongoDB Atlas...');
    await client.connect();
    
    const db = client.db(DB_NAME);
    const coleccion = db.collection('products'); // Colección exacta que leerá Mongoose

    // Limpiamos el catálogo viejo para mantener stocks y precios actualizados al día
    console.log('🧹 Limpiando base de datos con stock anterior...');
    await coleccion.deleteMany({});

    // Insertamos el nuevo lote de productos
    if (productosAInsertar.length > 0) {
      const resultado = await coleccion.insertMany(productosAInsertar);
      console.log('\n======================================================');
      console.log(`🎉 ¡Sincronización Exitosa en Atlas!`);
      console.log(`📊 Total de productos inyectados en la colección: ${resultado.insertedCount}`);
      console.log('======================================================\n');
    } else {
      console.log('⚠️ No se procesaron productos válidos para insertar.');
    }

  } catch (error) {
    console.error('❌ Error general durante el proceso de scraping/sincronización:', error.message);
  } finally {
    // Cerramos la conexión para liberar el recurso en Atlas
    await client.close();
    console.log('🔌 Conexión con MongoDB cerrada correctamente.');
  }
}

// Ejecución del Script
sincronizarConMongoDB();