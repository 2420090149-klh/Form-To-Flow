"use client"

import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { TeamSection } from "@/components/about/TeamSection"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Simple About Hero */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary tracking-wide uppercase shadow-sm mb-6">
                Our Mission
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6">
                Event check-ins shouldn&apos;t be a nightmare.
              </h1>
              <p className="text-xl text-muted-foreground">
                We are building the simplest, fastest, and most reliable way to turn any spreadsheet into a live check-in workflow.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Narrative Divider */}
        <section className="py-12 bg-slate-50 dark:bg-slate-900/20 text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <p className="text-lg font-medium text-foreground">
              Behind every smoother event experience is a team focused on removing the friction.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <TeamSection />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}
