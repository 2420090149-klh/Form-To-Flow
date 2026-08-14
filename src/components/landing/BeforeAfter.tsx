"use client"

import { motion } from "framer-motion"
import { X, Check } from "lucide-react"

export function BeforeAfter() {
  const beforePoints = [
    "Manual guest lists",
    "Searching spreadsheets",
    "Long entry queues",
    "Duplicate registrations",
    "Paper passes",
    "No live attendance data",
  ]

  const afterPoints = [
    "Centralized guest list",
    "Unique QR passes",
    "Fast check-ins",
    "Instant verification",
    "Digital passes",
    "Live attendance dashboard",
  ]

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
            Event check-in shouldn&apos;t be this complicated.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before FormToFlow */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-muted/30 border border-border flex flex-col h-full"
          >
            <h3 className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-6">
              Before FormToFlow
            </h3>
            <ul className="space-y-4 flex-1">
              {beforePoints.map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* With FormToFlow */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col h-full shadow-xl shadow-primary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <h3 className="text-sm font-bold text-primary tracking-widest uppercase mb-6 relative z-10">
              With FormToFlow
            </h3>
            <ul className="space-y-4 flex-1 relative z-10">
              {afterPoints.map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
