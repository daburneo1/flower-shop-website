"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Banknote, Building2, CreditCard, Smartphone, X } from "lucide-react"
import type { PaymentMethod } from "@/lib/types"

const iconMap: Record<string, React.ElementType> = {
  banknote: Banknote,
  building: Building2,
  smartphone: Smartphone,
  creditcard: CreditCard,
}

function getIcon(iconName: string | null): React.ElementType {
  if (!iconName) return Banknote
  return iconMap[iconName.toLowerCase()] ?? Banknote
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
}

export function PaymentMethods({ paymentMethods }: PaymentMethodsProps) {
  const [modalProviders, setModalProviders] = useState<PaymentMethod | null>(null)

  useEffect(() => {
    if (modalProviders) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [modalProviders])

  if (paymentMethods.length === 0) return null

  return (
    <>
      <section id="pagos" className="bg-card py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Facilidad de Pago</span>
            <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              <span className="text-balance">Metodos de Pago</span>
            </h2>
          </div>

          <div className={`grid gap-8 sm:grid-cols-${Math.min(paymentMethods.length, 3)}`}>
            {paymentMethods.map((method) => {
              const Icon = getIcon(method.icon)
              const hasProviders = method.providers && method.providers.length > 0

              if (hasProviders) {
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setModalProviders(method)}
                    className="flex flex-col items-center gap-5 border border-border/60 bg-card p-10 text-center transition-all duration-300 hover:cursor-pointer hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground">{method.name}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{method.description || "Escanea el QR de tu billetera favorita"}</p>
                  </button>
                )
              }

              return (
                <div
                  key={method.id}
                  className="flex flex-col items-center gap-5 border border-border/60 bg-card p-10 text-center transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">{method.name}</h3>
                  {method.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{method.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* QR Modal */}
      {modalProviders && modalProviders.providers && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setModalProviders(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${modalProviders.name} - Codigos QR`}
        >
          <div className="relative w-full max-w-3xl animate-in fade-in zoom-in-95 border border-border bg-card p-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setModalProviders(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-2 text-center font-serif text-3xl font-semibold text-foreground">{modalProviders.name}</h3>
            <p className="mb-10 text-center text-sm text-muted-foreground">Escanea el codigo QR con tu billetera favorita</p>

            <div className="flex flex-col items-center justify-center gap-10 sm:flex-row">
              {modalProviders.providers.map((provider) => (
                <div key={provider.id} className="flex flex-col items-center gap-3">
                  {provider.qr_code_url ? (
                    <div className="relative aspect-square w-44 overflow-hidden border border-border bg-background shadow-sm">
                      <Image src={provider.qr_code_url} alt={`QR ${provider.name}`} fill className="object-contain p-3" />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-44 items-center justify-center border border-border bg-background text-muted-foreground">
                      Sin QR
                    </div>
                  )}
                  <span className="text-sm font-semibold tracking-wide text-foreground">{provider.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
