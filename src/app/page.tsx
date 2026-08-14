import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { BeforeAfter } from "@/components/landing/BeforeAfter"
import { LiveCheckIn } from "@/components/landing/LiveCheckIn"
import { Features } from "@/components/landing/Features"
import { UseCases } from "@/components/landing/UseCases"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-1 flex flex-col w-full relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(59,130,246,0.03)_20%,rgba(59,130,246,0.03)_80%,transparent_100%)] pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col gap-12 md:gap-24 pb-24">
          <HeroSection />
          <HowItWorks />
          <BeforeAfter />
          <LiveCheckIn />
          <Features />
          <UseCases />
          <FinalCTA />
        </div>
      </main>

      <Footer />
    </div>
  )
}
