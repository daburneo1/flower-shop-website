import Image from "next/image"
import { X } from "lucide-react"
import { SECTION_COPY } from "@/lib/constants/site-copy"
import type { PaymentMethod } from "@/lib/types"

interface PaymentProvidersModalProps {
    method: PaymentMethod | null
    onClose: () => void
}

export function PaymentProvidersModal({
                                          method,
                                          onClose,
                                      }: PaymentProvidersModalProps) {
    if (!method?.providers?.length) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`${method.name} - Codigos QR`}
        >
            <div
                className="relative w-full max-w-3xl animate-in fade-in zoom-in-95 border border-border bg-card p-10 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Cerrar"
                >
                    <X className="h-5 w-5" />
                </button>

                <h3 className="mb-2 text-center font-serif text-3xl font-semibold text-foreground">
                    {method.name}
                </h3>

                <p className="mb-10 text-center text-sm text-muted-foreground">
                    {SECTION_COPY.paymentMethods.qrModalTitle}
                </p>

                <div className="flex flex-col items-center justify-center gap-10 sm:flex-row">
                    {method.providers.map((provider) => (
                        <div key={provider.id} className="flex flex-col items-center gap-3">
                            {provider.qr_code_url ? (
                                <div className="relative aspect-square w-44 overflow-hidden border border-border bg-background shadow-sm">
                                    <Image
                                        src={provider.qr_code_url}
                                        alt={`QR ${provider.name}`}
                                        fill
                                        className="object-contain p-3"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-square w-44 items-center justify-center border border-border bg-background text-muted-foreground">
                                    Sin QR
                                </div>
                            )}

                            <span className="text-sm font-semibold tracking-wide text-foreground">
                {provider.name}
              </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}