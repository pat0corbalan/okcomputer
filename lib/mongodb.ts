import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mi_ecommerce_dropshipping";

if (!MONGODB_URI) {
  throw new Error("Por favor, define la variable de entorno MONGODB_URI dentro de tu archivo .env");
}

// Configuración para evitar errores de almacenamiento global en desarrollo debido al Hot Reload de Next.js
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // Si ya tenemos una conexión activa en memoria, la reutilizamos
  if (cached.conn) {
    return cached.conn;
  }

  // Si se está conectando, esperamos esa misma promesa
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("🔌 Conectado exitosamente a MongoDB vía Mongoose");
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