import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/sonner"
import { storeConfig } from "@/lib/store-config"
import "./globals.css"

// Configuración óptima de tipografías cargadas localmente por el framework
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap", // Evita el parpadeo de texto invisible mientras descarga la fuente
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display", // Corregido el nombre para que mapee con font-display o tus clases personalizadas
  display: "swap",
})

export const metadata: Metadata = {
  title: `${storeConfig.name} — ${storeConfig.tagline}`,
  description: storeConfig.description,
  generator: "v0.app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#09090b", // Sincronizado exactamente con el color zinc-950 de Tailwind de tu fondo dark
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Previene el zoom automático molesto en inputs en iOS Safari
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="es" 
      className={`dark ${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}
      suppressHydrationWarning // Blindaje contra errores de hidratación provocados por extensiones del navegador
    >
      <head>
        {/* Pre-conectores de optimización de red para recursos críticos */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {process.env.NEXT_PUBLIC_API_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        )}
      </head>
      <body className="bg-zinc-950 text-zinc-50 font-sans antialiased selection:bg-zinc-100 selection:text-zinc-900 min-h-screen flex flex-col">
        
        {/* 🛒 Proveedor global unificado para toda la arquitectura */}
        <CartProvider>
          
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          {/* Notificaciones inteligentes adaptadas a la ergonomía del dispositivo */}
          <Toaster 
            position="bottom-center" // Mobile-first: Abajo en celulares
            expand={false}
            richColors
            closeButton
            className="md:!top-6 md:!bottom-auto" // Desktop override: Se reposiciona arriba en pantallas grandes
          />
          
        </CartProvider>

        {/* Analíticas en producción sin afectar el tiempo de carga inicial */}
        {process.env.NODE_ENV === "production" && <Analytics />}
        
      </body>
    </html>
  )
}