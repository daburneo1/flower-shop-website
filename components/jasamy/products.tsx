"use client"

import { useMemo, useState } from "react"
import { Reveal } from "@/components/jasamy/reveal"
import { CategoryTabs } from "@/components/jasamy/products/category-tabs"
import { ProductCard } from "@/components/jasamy/products/product-card"
import { ProductsEmptyState } from "@/components/jasamy/products/products-empty-state"
import { SECTION_COPY } from "@/lib/constants/site-copy"
import type { Florist, Category, Product } from "@/lib/types"

interface ProductsProps {
  florist: Florist
  categories: Category[]
  products: Product[]
}

export function Products({ florist, categories, products }: ProductsProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return products
    return products.filter((product) => product.category_id === activeCategoryId)
  }, [activeCategoryId, products])

  const activeCategory = useMemo(() => {
    if (!activeCategoryId) return null
    return categories.find((category) => category.id === activeCategoryId) ?? null
  }, [activeCategoryId, categories])

  return (
      <section id="productos" className="bg-background py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mb-12 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {SECTION_COPY.products.eyebrow}
          </span>
            <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              <span className="text-balance">{SECTION_COPY.products.title}</span>
            </h2>
          </Reveal>

          <CategoryTabs
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelect={setActiveCategoryId}
          />

          {activeCategory?.description && (
              <p className="mb-8 text-center text-sm italic text-muted-foreground">
                {activeCategory.description}
              </p>
          )}

          <p className="mb-8 text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            {activeCategory ? ` en ${activeCategory.name}` : " disponibles"}
          </p>

          {filteredProducts.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, index) => (
                    <Reveal key={product.id} delayMs={Math.min(index * 60, 240)}>
                      <ProductCard product={product} florist={florist} />
                    </Reveal>
                ))}
              </div>
          ) : (
              <ProductsEmptyState />
          )}
        </div>
      </section>
  )
}