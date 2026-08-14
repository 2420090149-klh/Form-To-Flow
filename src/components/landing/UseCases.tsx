"use client"

import { motion } from "framer-motion"
import { GraduationCap, Code2, Presentation, Users, Music, Briefcase } from "lucide-react"

export function UseCases() {
  const cases = [
    { name: "College Events", icon: GraduationCap },
    { name: "Hackathons", icon: Code2 },
    { name: "Conferences", icon: Presentation },
    { name: "Workshops", icon: Users },
    { name: "Festivals", icon: Music },
    { name: "Corporate Events", icon: Briefcase }
  ]

  return (
    <section id="use-cases" className="py-12 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Built for events where every second matters.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {cases.map((useCase, index) => (
            <motion.div
              key={useCase.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 md:p-8 rounded-2xl bg-background border border-border flex flex-col items-center justify-center text-center gap-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <useCase.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-foreground">{useCase.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
