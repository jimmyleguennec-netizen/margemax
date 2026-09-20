import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Demo } from "@/components/landing/demo";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { Features } from "@/components/landing/features";
import { QuickGuide } from "@/components/landing/quick-guide";
import { CreditCalculator } from "@/components/landing/credit-calculator";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { InteractiveGrid } from "@/components/ui/interactive-grid";
import { Reveal } from "@/components/ui/reveal";

export default function HomePage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-[#05050a]">
      <div
        aria-hidden
        className="pointer-events-none fixed -left-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-40 top-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[140px]"
      />

      <InteractiveGrid>
        <Navbar />
        <main>
          <Hero />
          <Reveal><Demo /></Reveal>
          <Reveal><InteractiveDemo /></Reveal>
          <Features />
          <Reveal><QuickGuide /></Reveal>
          <Reveal><CreditCalculator /></Reveal>
          <Pricing />
          <Reveal><Faq /></Reveal>
          <Reveal><Contact /></Reveal>
          <Footer />
        </main>
      </InteractiveGrid>
    </div>
  );
}
