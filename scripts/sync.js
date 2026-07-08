const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = "okcomputer";
const BASE = "http://importcellsgo.ddns.net/tienda";

// Cliente de Axios optimizado para catálogos pesados (30 segundos de margen)
const http = axios.create({
  baseURL: BASE,
  timeout: 30000, 
});

/**
 * Mide la profundidad de una categoría basada en sus niveles válidos
 */
const getCategoryDepth = (cat) => {
  if (!cat) return 0;
  return [cat.level0, cat.level1, cat.level2, cat.level3].filter(Boolean).length;
};

/**
 * Estructura las categorías desglosando el string fullPath en niveles legibles
 */
function buildCategoryMap(items) {
  const map = new Map();
  for (const c of items) {
    const parts = c.label.split("/").map(p => p.trim());
    map.set(c.id, {
      id: c.id,
      level0: parts[0] || null,
      level1: parts[1] || null,
      level2: parts[2] || null,
      level3: parts[3] || null,
      fullPath: c.label
    });
  }
  return map;
}

/**
 * Obtiene el listado de categorías inicial
 */
async function getCategorias() {
  const { data } = await http.get(`/catalogo_pdf_categorias.php?_=${Date.now()}`);
  return data.items || [];
}

/**
 * Hace scraping de productos con reintento automático exponencial ante caídas o timeouts
 */
async function getProductos(catId, retries = 2, delay = 1500) {
  try {
    const { data } = await http.get(`/catalogo.php?cat=${catId}`);
    const $ = cheerio.load(data);
    let scriptContent = "";

    $("script").each((_, el) => {
      const html = $(el).html();
      if (html?.includes("DATA")) scriptContent = html;
    });

    const match = scriptContent.match(/DATA\s*=\s*(\[[\s\S]*?\])/);
    if (!match) return [];

    return JSON.parse(match[1]);
  } catch (error) {
    if (retries > 0) {
      console.log(`⏳ Reintentando cat ID ${catId} (${retries} intentos restantes) por: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return getProductos(catId, retries - 1, delay * 2);
    }
    console.error(`❌ Error definitivo en cat ID ${catId}: ${error.message}`);
    return [];
  }
}

/**
 * Divide un array en bloques de tamaño fijo
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Orquestador principal del proceso de sincronización
 */
async function sync() {
  if (!MONGO_URI) {
    console.error("❌ MONGODB_URI no está definida en el entorno.");
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);
  console.log("🚀 Iniciando sincronización robusta...");

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection("products");

    const categorias = await getCategorias();
    const catMap = buildCategoryMap(categorias);
    console.log(`📂 Categorías mapeadas: ${categorias.length}`);

    // Procesamos en lotes pequeños para no saturar el servidor remoto
    const CONCURRENCY_LIMIT = 6;
    const catChunks = chunkArray(categorias, CONCURRENCY_LIMIT);
    const resultados = [];

    console.log(`📡 Descargando catálogos en lotes controlados de a ${CONCURRENCY_LIMIT}...`);
    
    for (let i = 0; i < catChunks.length; i++) {
      const chunk = catChunks[i];
      const promesasDelLote = chunk.map(async (cat) => {
        const productos = await getProductos(cat.id);
        return { catId: cat.id, productos };
      });
      
      const resLote = await Promise.all(promesasDelLote);
      resultados.push(...resLote);
      
      // Respiro sutil entre lotes para estabilizar la conexión remota
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const finalMap = new Map();

    for (const { catId, productos } of resultados) {
      const catInfo = catMap.get(catId);

      for (const p of productos) {
        if (!p?.codigo) continue;

        const sku = p.codigo.trim();
        const cost = p.p4 || 0;
        const existing = finalMap.get(sku);

        const productData = {
          sku,
          name: p.desc?.trim(),
          description: p.desc?.trim(),
          price: Math.round(cost * 1.35),
          cost,
          stock: p.agot ? 0 : (p.stock || 0),
          image: p.img ? `tienda/${p.img}` : null,
          category: catInfo,
          updatedAt: new Date()
        };

        if (existing) {
          if (!existing.categories.includes(catId)) {
            existing.categories.push(catId);
          }
          // Conserva siempre la categoría con la ruta más profunda
          if (getCategoryDepth(catInfo) > getCategoryDepth(existing.category)) {
            existing.category = catInfo;
          }
        } else {
          finalMap.set(sku, { ...productData, categories: [catId] });
        }
      }
    }

    const finalDocs = Array.from(finalMap.values());

    if (finalDocs.length > 0) {
      // Limpieza e inserción segura en lote
      await col.deleteMany({});
      await col.insertMany(finalDocs);
      console.log(`\n🎉 Sincronización impecable completada.`);
      console.log(`📦 Total de productos guardados en DB: ${finalDocs.length}`);
    } else {
      console.log("⚠️ No se encontraron productos para resguardar.");
    }

  } catch (err) {
    console.error("❌ Fallo crítico en la sincronización:", err);
  } finally {
    await client.close();
    console.log("🔌 Conexión a MongoDB cerrada de forma limpia.");
  }
}

sync();