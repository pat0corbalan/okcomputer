import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IProduct extends Document {
  sku: string;
  codigo_original: string | null;
  name: string;
  description: string;
  image: string | null;

  price: number;
  stock: number;
  costo: number;

  category: {
    id: number;
    level0: string;
    level1: string | null;
    level2: string | null;
    level3: string | null;
    fullPath: string;
  };

  categories: number[];

  actualizadoEn: Date;
}

const CategorySchema = new Schema(
  {
    id: { type: Number, required: true },
    level0: { type: String, required: true },
    level1: { type: String, default: null },
    level2: { type: String, default: null },
    level3: { type: String, default: null },
    fullPath: { type: String, required: true }
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>({
  sku: { type: String, required: true, unique: true },
  codigo_original: { type: String, default: null },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  image: { type: String, default: null },

  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  costo: { type: Number, required: true },

  category: { type: CategorySchema, required: true },

  categories: { type: [Number], default: [] },

  actualizadoEn: { type: Date, default: Date.now }
});

// ⚠️ IMPORTANTE: índice para evitar duplicados y mejorar búsqueda
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ "category.id": 1 });

const Product =
  models.Product || model<IProduct>("Product", ProductSchema);

export default Product;