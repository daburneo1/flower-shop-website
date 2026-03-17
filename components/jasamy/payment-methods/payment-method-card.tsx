import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react"
import type { ElementType } from "react"
import { SECTION_COPY } from "@/lib/constants/site-copy"
import type { PaymentMethod } from "@/lib/types"

const iconMap: Record<string, ElementType> = {
    banknote: Banknote,
    building: Building2,
    smartphone: Smartphone,
    creditcard: CreditCard,
}

function getIcon(iconName: string | null | undefined): ElementType {
    if (!iconName) return Banknote
    return iconMap[iconName.toLowerCase()] ?? Banknote
}

interface PaymentMethodCardProps {
    method: PaymentMethod
    onOpenProviders?: (method: PaymentMethod) => void
}

export function PaymentMethodCard({
                                      method,
                                      onOpenProviders,
                                  }: PaymentMethodCardProps) {
    const Icon = getIcon(method.icon)
    const hasProviders = Boolean(method.providers && method.providers.length > 0)
    const description =
        method.description || (hasProviders ? SECTION_COPY.paymentMethods.qrDescription : null)

    const content = (
        <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent/15">
                <Icon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground">{method.name}</h3>
            {description && (
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
        </>
    )

    if (hasProviders) {
        return (
            <button
                type="button"
                onClick={() => onOpenProviders?.(method)}
                className="flex h-full w-full flex-col items-center gap-5 rounded-2xl border border-border/60 bg-card p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:cursor-pointer hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_18px_35px_rgba(0,0,0,0.12)]"
            >
                {content}
            </button>
        )
    }

    return (
        <div className="flex h-full flex-col items-center gap-5 rounded-2xl border border-border/60 bg-card p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_18px_35px_rgba(0,0,0,0.12)]">
            {content}
        </div>
    )
}