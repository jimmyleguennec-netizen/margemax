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
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

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
    </div>
  );
}
