// =============================================================
//  CATALOGO DE PRODUCTOS — OKComputer
// =============================================================

// Modificado a `number` o `string` para soportar los nuevos IDs numéricos de la BD
export type CategoryId = number | string;

export interface CategoryDetails {
  id: number;
  level0: string;
  level1: string | null;
  level2: string | null;
  level3: string | null;
  fullPath: string;
}

export interface Product {
  id?: string;
  _id?: { $oid: string } | string; // Soporta el objeto ObjectId de MongoDB o string directo
  sku: string;
  codigo_original?: string | null;
  name: string;
  description: string;
  price: number;
  agot: boolean;
  cost?: number; // Añadido por el nuevo modelo
  stock: number; // Cambiado de boolean a number para manejar cantidades reales de stock
  image: string | null;
  category: CategoryDetails; // Ahora es el objeto detallado con niveles
  categories: number[];      // Array de IDs de categorías vinculadas
  updatedAt?: { $date: string } | string;
}

export type Category = {
  id: CategoryId;
  name: string;
}

// Mapeo inicial de categorías base (puedes expandirlo con los IDs reales de tu BD)
export const categories: Category[] = [
  { id: 1, name: "Accesorios Celular" }, // Corresponde al level0 "Accesorios para celulares" de tu JSON
  { id: 7, name: "Blindados 9D" },
  { id: 11, name: "Samsung" },
  { id: "informatica", name: "Informática" },
  { id: "electronica", name: "Electrónica" },
  { id: "repuestos", name: "Repuestos" },
  { id: "herramientas", name: "Herramientas" },
  { id: "hogar", name: "Hogar" },
]

/**
 * Devuelve el nombre de la categoría mapeada o el nivel principal del producto si no se encuentra en la lista estática.
 */
export function getCategoryName(id: CategoryId): string {
  const found = categories.find((c) => c.id === id || c.id === Number(id))
  return found ? found.name : String(id)
}