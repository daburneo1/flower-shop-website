"use client"

import { useState } from "react"
import Image from "next/image"
import { buildWhatsAppUrl } from "@/lib/config"
import type { Florist, Category, Product } from "@/lib/types"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function ProductCard({ product, florist }: { product: Product; florist: Florist }) {
  const whatsappUrl = buildWhatsAppUrl(
    florist.name,
    florist.whatsapp_number || "",
    product.name,
    product.price,
  )

  return (
    <article className="group flex flex-col overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">Sin imagen</div>
        )}
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/5" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-serif text-xl font-semibold text-foreground">{product.name}</h3>
        {product.description && (
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
          <span className="font-serif text-2xl font-semibold text-primary">${product.price.toFixed(2)}</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            Lo quiero
          </a>
        </div>
      </div>
    </article>
  )
}

interface ProductsProps {
  florist: Florist
  categories: Category[]
  products: Product[]
}

export function Products({ florist, categories, products }: ProductsProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const filteredProducts = activeCategoryId
    ? products.filter((p) => p.category_id === activeCategoryId)
    : products

  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : null

  return (
    <section id="productos" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Nuestro Catalogo</span>
          <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
            <span className="text-balance">Productos y Servicios</span>
          </h2>
        </div>

        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-1 border-b border-border/40">
            <button
              onClick={() => setActiveCategoryId(null)}
              className={`whitespace-nowrap px-5 py-2.5 text-sm tracking-wide transition-all ${
                activeCategoryId === null
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "border-b border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`whitespace-nowrap px-5 py-2.5 text-sm tracking-wide transition-all ${
                  activeCategoryId === cat.id
                    ? "border-b-2 border-primary font-medium text-primary"
                    : "border-b border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {activeCategory?.description && (
          <p className="mb-8 text-center text-sm italic text-muted-foreground">{activeCategory.description}</p>
        )}

        <p className="mb-8 text-sm text-muted-foreground">
          {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
          {activeCategory ? ` en ${activeCategory.name}` : " disponibles"}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} florist={florist} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="font-serif text-lg text-muted-foreground">No hay productos en esta categoria aun.</p>
          </div>
        )}
      </div>
    </section>
  )
}
