const axios = require('axios');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');

// Configuración de Margen, Stock y base de datos
const MARGEN_GANANCIA = 1.35; 
const COLCHON_STOCK = 2;       
const MONGO_URI = "mongodb://localhost:27017"; // Cambiala por tu URI de Mongo (local o Atlas)
const DB_NAME = "mi_ecommerce_dropshipping";

async function sincronizarConMongoDB() {
  console.log('🚀 INICIANDO SCRAPER E INYECCIÓN A MONGO DB...');
  
  const urlCatalogo = 'http://importcellsgo.ddns.net/tienda/catalogo.php?cat=149';
  let productosAInsertar = [];
  
  const client = new MongoClient(MONGO_URI);

  try {
    // 1. Descarga del catálogo del proveedor
    const respuesta = await axios.get(urlCatalogo, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 15000
    });

    const $ = cheerio.load(respuesta.data);
    let scriptContenido = '';

    $('script').each((i, el) => {
      const htmlInterno = $(el).html();
      if (htmlInterno && htmlInterno.includes('DATA')) {
        scriptContenido = htmlInterno;
      }
    });

    if (!scriptContenido) {
      console.log('❌ No se encontró la variable DATA.');
      return;
    }

    const regexData = /DATA\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/;
    const match = scriptContenido.match(regexData);

    if (!match || !match[1]) return;

    const productosCrudos = JSON.parse(match[1]);

    // 2. Procesamiento de los datos de dropshipping
    productosCrudos.forEach(p => {
      if (p.desc && p.p4) {
        const stockTotal = parseInt(p.stock, 10) || 0;
        let stockVenta = stockTotal <= COLCHON_STOCK ? 0 : stockTotal;
        if (p.agot) stockVenta = 0;

        const costoMayorista = parseFloat(p.p4) || 0;
        const precioVentaFinal = Math.round(costoMayorista * MARGEN_GANANCIA);

        const skuGenerado = p.codigo 
          ? p.codigo.toLowerCase().trim().replace(/[^a-z0-9]/g, '-') 
          : p.desc.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

        // Ignoramos el nivel del piso. Lo tratamos como categoría general "Tecnología/Accesorios"
        const categoriaUnificada = "Accesorios de Celulares"; 

        if (costoMayorista > 0) {
          productosAInsertar.push({
            sku: skuGenerado,
            codigo_original: p.codigo || null,
            name: p.desc, // Lo guardamos como 'name' para que machee con tu Front
            description: `Accesorio de alta calidad. Código de producto: ${p.codigo || 'S/N'}.`,
            image: p.img ? `tienda/${p.img}` : null, // Guardamos la ruta relativa limpia
            price: precioVentaFinal,
            category: categoriaUnificada,
            stock: stockVenta,
            costo: costoMayorista,
            actualizadoEn: new Date()
          });
        }
      }
    });

    // 3. Conexión e inserción en MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    const coleccion = db.collection('products');

    // Limpiamos los productos viejos para mantener el stock real del proveedor diario
    console.log('🧹 Limpiando catálogo anterior...');
    await coleccion.deleteMany({});

    // Insertamos el catálogo nuevo actualizado
    if (productosAInsertar.length > 0) {
      const resultado = await coleccion.insertMany(productosAInsertar);
      console.log(`✅ ¡Sincronización exitosa con Mongo! Se cargaron ${resultado.insertedCount} productos.`);
    }

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  } finally {
    await client.close();
  }
}

sincronizarConMongoDB();