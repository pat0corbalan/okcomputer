// =============================================================
//  CATALOGO DE PRODUCTOS — OKComputer
//  Para agregar/editar productos, modifica el array `products`.
//  Cada producto debe tener un `id` unico.
// =============================================================

export type CategoryId =
  | "accesorios"
  | "informatica"
  | "electronica"
  | "repuestos"
  | "herramientas"
  | "hogar"

export type Category = {
  id: CategoryId
  name: string
}

export interface Product {
  id?: string;       // Puede ser opcional ahora
  _id?: string;      // Añade este campo para MongoDB
  sku: string;
  codigo_original?: string | null;
  name: string;
  description: string;
  image: string | null;
  price: number;
  category: CategoryId; // O string según lo uses
  stock: boolean;
}

export const categories: Category[] = [
  { id: "accesorios", name: "Accesorios Celular" },
  { id: "informatica", name: "Informática" },
  { id: "electronica", name: "Electrónica" },
  { id: "repuestos", name: "Repuestos" },
  { id: "herramientas", name: "Herramientas" },
  { id: "hogar", name: "Hogar" },
]

export function getCategoryName(id: CategoryId): string {
  return categories.find((c) => c.id === id)?.name ?? id
}
