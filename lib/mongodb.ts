import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Configuración para evitar errores de almacenamiento global en desarrollo debido al Hot Reload de Next.js
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // 1. Validamos ACÁ adentro para que TypeScript entienda que MONGODB_URI sí o sí es un string válido en tiempo de ejecución
  if (!MONGODB_URI) {
    throw new Error("Por favor, define la variable de entorno MONGODB_URI dentro de tu archivo .env.local");
  }

  // Si ya tenemos una conexión activa en memoria, la reutilizamos
  if (cached.conn) {
    return cached.conn;
  }

  // Si se está conectando, esperamos esa misma promesa
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "okcomputer", 
    };

    // Ahora TypeScript sabe con 100% de certeza que MONGODB_URI es un string
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}