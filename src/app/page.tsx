
import ContactInfo from "@/components/pages/home/contact-info"
import CtaSection from "@/components/pages/home/cta-section"
import FaqSection from "@/components/pages/home/faq-section"
import FeaturesSection from "@/components/pages/home/features-section"
import HeroSection from "@/components/pages/home/hero-section"
import HowItWorks from "@/components/pages/home/how-it-works"
import PricingSection from "@/components/pages/home/pricing"
import Testimonialssection from "@/components/pages/home/testimonials-section"
import TrustedBy from "@/components/pages/home/trusted-by"
import { Footer } from "@/components/shared/footer"
import { Header } from "@/components/shared/header"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <HeroSection />
        {/* Trusted By Section */}
        <TrustedBy />
        {/* Features Section */}
        <FeaturesSection />
        {/* How It Works Section */}
        <HowItWorks />
        {/* Testimonials Section */}
        <Testimonialssection />
        {/* Pricing Section  */}
        <PricingSection />
        {/* FAQ Section */}
        <FaqSection />
        {/* CTA Section */}
        <CtaSection />
        {/* Contact Section */}
        <ContactInfo />
      </main>
      <Footer />
    </>
  )
}
