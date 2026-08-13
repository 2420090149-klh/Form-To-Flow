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
      
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <BeforeAfter />
        <LiveCheckIn />
        <Features />
        <UseCases />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}
