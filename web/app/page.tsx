import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Demo } from "@/components/landing/demo";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { CtaFooter } from "@/components/landing/cta-footer";

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
        <Features />
        <Pricing />
        <CtaFooter />
      </main>
    </div>
  );
}
