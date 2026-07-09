import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/sonner"
import { storeConfig } from "@/lib/store-config"
import "./globals.css"

// Tipografía principal
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Tipografía para títulos / elementos destacados
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  title: `${storeConfig.name} — ${storeConfig.tagline}`,
  description: storeConfig.description,
  generator: "v0.app",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Sincronizamos el color del navegador móvil con el azul noche de la imagen
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0f1d", 
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"

    >
      <head>
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {process.env.NEXT_PUBLIC_API_URL && (
          <link
            rel="preconnect"
            href={process.env.NEXT_PUBLIC_API_URL}
          />
        )}
      </head>

      {/* Eliminamos bg-zinc-950 para usar bg-background heredado de globals.css y cambiamos la selección al cian de tus neones */}
      <body className="bg-background text-foreground font-sans antialiased selection:bg-neon-cyan/30 selection:text-white min-h-screen flex flex-col">
        <CartProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          <Toaster
          position="bottom-center"
          expand={false}
          theme="dark" // Le avisa a Sonner que use estilos oscuros por defecto
          closeButton={false} // Quitamos el botón x genérico que rompe tu diseño cyberpunk
          toastOptions={{
            style: {
              background: 'rgba(13, 21, 39, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#ffffff',
            }
          }}
        />
        </CartProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}