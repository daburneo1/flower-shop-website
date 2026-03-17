import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { buildWhatsAppUrl } from "@/lib/config"
import { WhatsAppIcon } from "@/components/jasamy/shared/whatsapp-icon"
import type { Florist, Product } from "@/lib/types"

interface ProductCardProps {
    product: Product
    florist: Florist
}

export function ProductCard({ product, florist }: ProductCardProps) {
    const whatsappUrl = buildWhatsAppUrl(
        florist.name,
        florist.whatsapp_number || "",
        product.name,
        product.price,
    )

    return (
        <article className="group product-card flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="relative aspect-[4/3] overflow-hidden">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                        Sin imagen
                    </div>
                )}
                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/5" />
            </div>

            <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="font-serif text-xl font-semibold text-foreground">{product.name}</h3>

                {product.description && (
                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                        {product.description}
                    </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
          <span className="font-serif text-2xl font-semibold text-primary">
            ${product.price.toFixed(2)}
          </span>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
                    >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        Lo quiero
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </article>
    )
}