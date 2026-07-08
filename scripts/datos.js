const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE = "http://importcellsgo.ddns.net/tienda";

// Cambiá este ID por una categoría real
const CAT_ID = 1;

const http = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

async function debugCategoria() {
  try {
    console.log(`🔎 Consultando categoría ${CAT_ID}...`);

    const { data } = await http.get(`/catalogo.php?cat=${CAT_ID}`);

    const $ = cheerio.load(data);

    let scriptContent = "";

    $("script").each((_, el) => {
      const html = $(el).html();
      if (html?.includes("DATA")) {
        scriptContent = html;
      }
    });

    if (!scriptContent) {
      console.log("❌ No se encontró DATA en la página");
      return;
    }

    const match = scriptContent.match(/DATA\s*=\s*(\[[\s\S]*?\])/);

    if (!match) {
      console.log("❌ No se pudo extraer el JSON");
      return;
    }

    const productos = JSON.parse(match[1]);

    console.log(`✅ Productos encontrados: ${productos.length}`);

    if (productos.length === 0) return;

    console.log("\n📦 Primer producto completo:");
    console.dir(productos[0], { depth: null });

    console.log("\n🔑 Campos disponibles:");
    console.log(Object.keys(productos[0]));

    fs.writeFileSync(
      "productos_debug.json",
      JSON.stringify(productos, null, 2),
      "utf8"
    );

    console.log("\n💾 Guardado: productos_debug.json");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

debugCategoria();