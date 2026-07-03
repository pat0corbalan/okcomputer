import mongoose, { Schema, Document, models, model } from "mongoose";

// Definimos la interfaz para TypeScript
export interface IProduct extends Document {
  sku: string;
  codigo_original: string | null;
  name: string;
  description: string;
  image: string | null;
  price: number;
  category: string;
  stock: number;
  costo: number;
  actualizadoEn: Date;
}

// Creamos el esquema de Mongoose
const ProductSchema = new Schema<IProduct>({
  sku: { type: String, required: true, unique: true },
  codigo_original: { type: String, default: null },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  image: { type: String, default: null },
  price: { type: Number, required: true },
  category: { type: String, required: true, default: "Accesorios de Celulares" },
  stock: { type: Number, required: true, default: 0 },
  costo: { type: Number, required: true },
  actualizadoEn: { type: Date, default: Date.now }
});

// Muy importante en Next.js: Si el modelo ya existe en la caché de Mongoose, lo reutiliza. 
// Si no, lo crea de cero. Esto evita el error "Cannot overwrite model once compiled".
const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;