import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Metrics } from "@/components/landing/metrics";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MarketplacePreview } from "@/components/landing/marketplace-preview";
import { Transparency } from "@/components/landing/transparency";
import { InvestorExperience, FarmerExperience } from "@/components/landing/experiences";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Metrics />
        <Features />
        <HowItWorks />
        <MarketplacePreview />
        <Transparency />
        <InvestorExperience />
        <FarmerExperience />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
