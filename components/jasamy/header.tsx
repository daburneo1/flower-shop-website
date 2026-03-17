"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { PRIMARY_NAV_LINKS } from "@/lib/constants/site-copy"
import type { Florist } from "@/lib/types"

interface HeaderProps {
  florist: Florist
}

export function Header({ florist }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
      <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
              isScrolled
                  ? "border-b border-border/40 bg-card/70 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/65"
                  : "bg-transparent"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-baseline gap-2">
          <span
              className={`font-serif text-2xl font-semibold tracking-wide transition-colors lg:text-3xl ${
                  isScrolled ? "text-foreground" : "text-card"
              }`}
          >
            {florist.name}
          </span>
            {florist.tagline && (
                <span
                    className={`hidden text-xs uppercase tracking-[0.2em] transition-colors sm:inline ${
                        isScrolled ? "text-primary" : "text-card/90"
                    }`}
                >
              {florist.tagline}
            </span>
            )}
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Navegacion principal">
            {PRIMARY_NAV_LINKS.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm tracking-wide transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
                        isScrolled ? "text-muted-foreground hover:text-foreground" : "text-card/85 hover:text-card"
                    }`}
                >
                  {link.label}
                </a>
            ))}
            <Link
                href="/admin"
                className={`rounded-full border px-5 py-2 text-xs uppercase tracking-widest transition-all ${
                    isScrolled
                        ? "border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                        : "border-card/60 text-card hover:bg-card hover:text-foreground"
                }`}
            >
              Admin
            </Link>
          </nav>

          <button
              type="button"
              className={`md:hidden ${isScrolled ? "text-foreground" : "text-card"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
            <nav
                className="border-t border-border/40 bg-card/95 px-6 pb-8 pt-6 backdrop-blur-xl md:hidden"
                aria-label="Navegacion movil"
            >
              <div className="flex flex-col gap-5">
                {PRIMARY_NAV_LINKS.map((link) => (
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