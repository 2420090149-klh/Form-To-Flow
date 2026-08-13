"use client"

import { motion } from "framer-motion"
import { UploadCloud, QrCode, SmartphoneNfc } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "IMPORT",
      heading: "Upload your guest list",
      description: "Bring your Excel file or connect Google Sheets.",
      icon: UploadCloud,
    },
    {
      number: "02",
      title: "GENERATE",
      heading: "Create QR passes",
      description: "Automatically generate unique QR codes for every attendee.",
      icon: QrCode,
    },
    {
      number: "03",
      title: "SCAN",
      heading: "Check them in",
      description: "Scan at the entrance and verify attendees instantly.",
      icon: SmartphoneNfc,
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-slate-50/50 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
            From Spreadsheet to Door.
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to turn a guest list into a seamless check-in experience.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 z-0">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-background border border-border p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 text-8xl font-black text-muted/30 select-none group-hover:text-primary/10 transition-colors">
                  {step.number}
                </div>
                
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8" />
                </div>

                <div className="text-sm font-bold text-primary tracking-widest uppercase mb-2">
                  {step.title}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.heading}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
