import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    const imagePath = path.join("/");

    const imageUrl = `http://importcellsgo.ddns.net/tienda2/${imagePath}`;

    const response = await fetch(imageUrl, {
      headers: {
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

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "image/jpeg",

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