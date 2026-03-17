import { SECTION_COPY } from "@/lib/constants/site-copy"

export function ProductsEmptyState() {
    return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="font-serif text-lg text-muted-foreground">
                {SECTION_COPY.products.emptyMessage}
            </p>
        </div>
    )
}