const axios = require('axios');

async function mapearCategorias() {
  const url = 'http://importcellsgo.ddns.net/tienda/catalogo_pdf_categorias.php?_=' + Date.now();

  console.log('📡 Consultando árbol de categorías de Importcell...');

  try {
    const respuesta = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!respuesta.data || !respuesta.data.ok) {
      console.log('⚠️ El servidor respondió pero no devolvió un estado OK.');
      return;
    }

    const items = respuesta.data.items;

    console.log('\n✅ Árbol de categorías obtenido con éxito!');
    console.log(`📦 Total de registros: ${items.length}\n`);

    // Agrupar por categoría principal
    const categorias = {};

    for (const item of items) {
      const principal = item.label.split('/')[0].trim();

      if (!categorias[principal]) {
        categorias[principal] = [];
      }

      categorias[principal].push({
        id: item.id,
        label: item.label,
        nivel: item.nivel
      });
    }

    // Mostrar resultados
    Object.entries(categorias).forEach(([nombre, lista]) => {
      console.log('='.repeat(70));
      console.log(`📂 ${nombre}`);
      console.log('='.repeat(70));

      lista.forEach(cat => {
        console.log(
          `ID: ${String(cat.id).padEnd(4)} | Nivel: ${cat.nivel} | ${cat.label}`
        );
      });

      console.log(`Total: ${lista.length}\n`);
    });

  } catch (error) {
    console.error('❌ Error consultando el endpoint:', error.message);
  }
}

mapearCategorias();