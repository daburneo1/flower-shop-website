import { getFloristFullData } from "@/lib/queries"
import { Header } from "@/components/jasamy/header"
import { Hero } from "@/components/jasamy/hero"
import { About } from "@/components/jasamy/about"
import { Products } from "@/components/jasamy/products"
import { Testimonials } from "@/components/jasamy/testimonials"
import { Gallery } from "@/components/jasamy/gallery"
import { PaymentMethods } from "@/components/jasamy/payment-methods"
import { Contact } from "@/components/jasamy/contact"
import { WhatsAppFloat } from "@/components/jasamy/whatsapp-float"
import { Footer } from "@/components/jasamy/footer"

export default async function Page() {
  const data = await getFloristFullData()

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">
          No se encontro la floristeria. Verifica NEXT_PUBLIC_FLORIST_ID.
        </p>
      </div>
    )
  }

  const { florist, categories, products, paymentMethods, about, contactMethods, socialLinks } = data

  return (
    <>
      <Header florist={florist} />
      <main>
        <Hero florist={florist} />
        <About about={about} />
        <Products florist={florist} categories={categories} products={products} />
        <Testimonials />
        <Gallery />
        <PaymentMethods paymentMethods={paymentMethods} />
        <Contact florist={florist} contactMethods={contactMethods} />
      </main>
      <WhatsAppFloat florist={florist} contactMethods={contactMethods} />
      <Footer florist={florist} socialLinks={socialLinks} />
    </>
  )
}
