"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import type { Florist } from "@/lib/types"

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Productos", href: "#productos" },
  { label: "Pagos", href: "#pagos" },
  { label: "Contacto", href: "#contacto" },
]

interface HeaderProps {
  florist: Florist
}

export function Header({ florist }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-semibold tracking-wide text-foreground lg:text-3xl">
            {florist.name}
          </span>
          {florist.tagline && (
            <span className="hidden text-xs uppercase tracking-[0.2em] text-accent sm:inline">
              {florist.tagline}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Navegacion principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm tracking-wide text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/admin"
            className="border border-primary/20 px-5 py-2 text-xs uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Admin
          </Link>
        </nav>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/60 bg-card px-6 pb-8 pt-6 md:hidden" aria-label="Navegacion movil">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/admin"
              className="mt-2 inline-block border border-primary/20 px-5 py-2 text-center text-xs uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
