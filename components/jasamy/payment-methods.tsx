"use client"

import { useEffect, useState } from "react"
import { Reveal } from "@/components/jasamy/reveal"
import { PaymentMethodsGrid } from "@/components/jasamy/payment-methods/payment-methods-grid"
import { PaymentProvidersModal } from "@/components/jasamy/payment-methods/payment-providers-modal"
import { SECTION_COPY } from "@/lib/constants/site-copy"
import type { PaymentMethod } from "@/lib/types"

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
}

export function PaymentMethods({ paymentMethods }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

  useEffect(() => {
    document.body.style.overflow = selectedMethod ? "hidden" : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedMethod])

  if (paymentMethods.length === 0) return null

  return (
      <>
        <section id="pagos" className="bg-card py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="mb-16 text-center">
            <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {SECTION_COPY.paymentMethods.eyebrow}
            </span>
              <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
                <span className="text-balance">{SECTION_COPY.paymentMethods.title}</span>
              </h2>
            </Reveal>

            <PaymentMethodsGrid
                paymentMethods={paymentMethods}
                onOpenProviders={setSelectedMethod}
            />
          </div>
        </section>

        <PaymentProvidersModal
            method={selectedMethod}
            onClose={() => setSelectedMethod(null)}
        />
      </>
  )
}