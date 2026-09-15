import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Demo } from "@/components/landing/demo";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { CtaFooter } from "@/components/landing/cta-footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Demo />
        <Features />
        <Pricing />
        <CtaFooter />
      </main>
    </>
  );
}
