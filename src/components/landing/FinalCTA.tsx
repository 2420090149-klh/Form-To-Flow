"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FinalCTA() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6">
            Make your next event effortless.
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            From your guest list to the entrance, FormToFlow keeps every check-in simple.
          </p>
          
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl group-hover:bg-primary/60 transition-colors duration-500" />
            <Link 
              href="/register" 
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }), 
                "relative text-lg px-10 h-16 bg-primary text-primary-foreground shadow-2xl shadow-primary/25 hover:scale-105 transition-all duration-300 font-semibold rounded-full"
              )}
            >
              Create Your Event &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
