import React from "react"
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { getFlorist } from '@/lib/queries'

import './globals.css'

// ── FONTS ──────────────────────────────────────────────────
// To change fonts for a different shop:
// 1. Import the desired Google Fonts below
// 2. Update the variable names to match --font-serif / --font-sans
// 3. Update tailwind.config.ts fontFamily to match
// ───────────────────────────────────────────────────────────
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  const florist = await getFlorist()

  return {
    title: florist ? `${florist.name} - ${florist.tagline || "Floristeria"}` : "Floristeria",
    description: florist?.tagline || "Floristeria artesanal",
  }
}

export const viewport: Viewport = {
  themeColor: "#365a3e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="es" className="scroll-smooth">
      <body className={`${dmSans.variable} ${cormorant.variable} font-sans antialiased`}>
      {children}
      </body>
      </html>
  )
}
