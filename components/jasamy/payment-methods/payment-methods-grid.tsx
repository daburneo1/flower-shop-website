import { Reveal } from "@/components/jasamy/reveal"
import { PaymentMethodCard } from "@/components/jasamy/payment-methods/payment-method-card"
import type { PaymentMethod } from "@/lib/types"

interface PaymentMethodsGridProps {
    paymentMethods: PaymentMethod[]
    onOpenProviders: (method: PaymentMethod) => void
}

export function PaymentMethodsGrid({
                                       paymentMethods,
                                       onOpenProviders,
                                   }: PaymentMethodsGridProps) {
    const gridColsClass =
        paymentMethods.length >= 3
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : paymentMethods.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-1"

    return (
        <div className={`grid gap-8 ${gridColsClass}`}>
            {paymentMethods.map((method, index) => (
                <Reveal key={method.id} delayMs={Math.min(index * 70, 210)}>
                    <PaymentMethodCard method={method} onOpenProviders={onOpenProviders} />
                </Reveal>
            ))}
        </div>
    )
}