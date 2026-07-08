import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join("/");

    const imageUrl = `http://importcellsgo.ddns.net/tienda2/${imagePath}`;

    const response = await fetch(imageUrl, {
      headers: {
        // Algunos servidores bloquean peticiones sin User-Agent
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      console.error(
        "❌ Imagen no encontrada:",
        imageUrl,
        response.status
      );

      return new NextResponse(null, {
        status: 404,
      });
    }

    const contentType =
      response.headers.get("content-type") || "image/jpeg";

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,

        // Cache para no pedir siempre al servidor viejo
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    });

  } catch (error: any) {
    console.error("❌ Error API GET /api/image:", error);

    return NextResponse.json(
      {
        error: "Error al obtener imagen",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}