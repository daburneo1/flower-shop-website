import { SECTION_COPY } from "@/lib/constants/site-copy"
import type { Category } from "@/lib/types"

interface CategoryTabsProps {
    categories: Category[]
    activeCategoryId: string | null
    onSelect: (categoryId: string | null) => void
}

export function CategoryTabs({
                                 categories,
                                 activeCategoryId,
                                 onSelect,
                             }: CategoryTabsProps) {
    if (categories.length === 0) return null

    return (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-1 border-b border-border/40">
            <button
                type="button"
                onClick={() => onSelect(null)}
                className={`whitespace-nowrap px-5 py-2.5 text-sm tracking-wide transition-all ${
                    activeCategoryId === null
                        ? "border-b-2 border-primary font-medium text-primary"
                        : "border-b border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
            >
                {SECTION_COPY.products.allLabel}
            </button>

            {categories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelect(category.id)}
                    className={`whitespace-nowrap px-5 py-2.5 text-sm tracking-wide transition-all ${
                        activeCategoryId === category.id
                            ? "border-b-2 border-primary font-medium text-primary"
                            : "border-b border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    )
}