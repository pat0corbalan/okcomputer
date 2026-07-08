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

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#09090b",
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
      className={`dark ${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}
      suppressHydrationWarning
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

      <body className="bg-zinc-950 text-zinc-50 font-sans antialiased selection:bg-zinc-100 selection:text-zinc-900 min-h-screen flex flex-col">
        <CartProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          <Toaster
            position="bottom-center"
            expand={false}
            richColors
            closeButton
            className="md:!top-6 md:!bottom-auto"
          />
        </CartProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}