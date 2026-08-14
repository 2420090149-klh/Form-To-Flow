"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FileSpreadsheet, DownloadCloud, QrCode, ScanLine, UserCheck, LayoutDashboard } from "lucide-react"

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const steps = [
    {
      title: "Spreadsheet",
      description: "Start with your raw guest list in Excel or Google Sheets.",
      icon: FileSpreadsheet,
      color: "from-green-500 to-emerald-500",
      bgLight: "bg-green-500/10",
      iconColor: "text-green-500"
    },
    {
      title: "Import",
      description: "Map columns intelligently and extract guest details seamlessly.",
      icon: DownloadCloud,
      color: "from-blue-500 to-indigo-500",
      bgLight: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      title: "QR Generation",
      description: "Automatically generate and email unique branded passes.",
      icon: QrCode,
      color: "from-indigo-500 to-violet-500",
      bgLight: "bg-indigo-500/10",
      iconColor: "text-indigo-500"
    },
    {
      title: "Door Scan",
      description: "Rapidly scan QR passes at the entrance using any device.",
      icon: ScanLine,
      color: "from-violet-500 to-purple-500",
      bgLight: "bg-violet-500/10",
      iconColor: "text-violet-500"
    },
    {
      title: "Verification",
      description: "Instantly validate guests, prevent duplicates, and identify VIPs.",
      icon: UserCheck,
      color: "from-purple-500 to-fuchsia-500",
      bgLight: "bg-purple-500/10",
      iconColor: "text-purple-500"
    },
    {
      title: "Live Dashboard",
      description: "Monitor real-time check-in stats and attendance metrics.",
      icon: LayoutDashboard,
      color: "from-fuchsia-500 to-pink-500",
      bgLight: "bg-fuchsia-500/10",
      iconColor: "text-fuchsia-500"
    }
  ]

  return (
    <section id="workflow" className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={containerRef}>
        
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              The FormToFlow Engine
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
              A Continuous Flow.
            </h2>
            <p className="text-xl text-muted-foreground">
              Watch how raw data seamlessly transforms into an enterprise-grade live event experience without missing a beat.
            </p>
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Continuous Glowing Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-1 bg-border/40 md:-translate-x-1/2 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
              style={{
                height: useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"])
              }}
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 relative ${isEven ? "md:flex-row-reverse" : ""}`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-[28px] md:left-1/2 top-0 md:top-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full md:-translate-x-1/2 md:-translate-y-1/2 z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">
                    <motion.div 
                      className="w-1.5 h-1.5 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: [0, 1.5, 1] }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    />
                  </div>

                  {/* Content Container */}
                  <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                    <div className="group cursor-default">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.bgLight} mb-6 border border-white/5 shadow-lg group-hover:scale-110 transition-transform duration-500 ${isEven ? "md:ml-auto" : ""}`}>
                        <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      
                      <p className={`text-muted-foreground text-lg leading-relaxed max-w-sm ${isEven ? "md:ml-auto" : ""}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty space for the other side */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
