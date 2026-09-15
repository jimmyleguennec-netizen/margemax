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
import { CtaFooter } from "@/components/landing/cta-footer";
import { LiveActivityToast } from "@/components/landing/live-activity-toast";
import { InteractiveGrid } from "@/components/ui/interactive-grid";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050a]">
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
          <Demo />
          <InteractiveDemo />
          <Features />
          <QuickGuide />
          <CreditCalculator />
          <Pricing />
          <Faq />
          <Contact />
          <CtaFooter />
        </main>

        <LiveActivityToast />
      </InteractiveGrid>
    </div>
  );
}
