"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle2, QrCode, FileSpreadsheet, Activity, Check, ScanLine } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center self-center lg:self-start rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary tracking-wide uppercase shadow-sm">
              The smarter way to manage event entry
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Your Guest List.<br />
              <span className="text-primary">Your Event.</span><br />
              Simplified.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Import your guest list, generate QR passes, and check attendees in at the door without the chaos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 items-center justify-center lg:justify-start">
              <Link 
                href="/register" 
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }), 
                  "text-base px-8 h-14 bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300 w-full sm:w-auto font-semibold"
                )}
              >
                Create Your Event &rarr;
              </Link>
              <Link 
                href="#how-it-works" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "text-base px-8 h-14 border-border hover:bg-muted transition-all duration-300 w-full sm:w-auto font-medium"
                )}
              >
                See How It Works
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-6 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Excel & Sheets</span>
              <span className="flex items-center gap-2"><QrCode className="w-4 h-4" /> QR Codes</span>
              <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Live Dashboard</span>
            </div>
          </motion.div>

          {/* Right Column - Product Visuals */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center mt-10 lg:mt-0"
          >
            {/* Main Mock Dashboard */}
            <div className="relative z-20 w-full max-w-[420px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">TechFest 2026</h3>
                  <p className="text-xs text-muted-foreground">Today, 09:00 AM</p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  EVENT LIVE
                </div>
              </div>
              
              <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Total</span>
                    <span className="text-xl font-bold">1,248</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-primary font-medium uppercase">Checked In</span>
                    <span className="text-xl font-bold text-primary">1,104</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Remaining</span>
                    <span className="text-xl font-bold">144</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Attendance</span>
                    <span className="text-primary">88.4%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "88.4%" }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating QR Scanner Animation */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="hidden sm:block absolute -right-2 md:-right-8 lg:-right-12 bottom-4 md:bottom-12 z-30 w-56 md:w-64 bg-background border border-border rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-3 md:p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-semibold flex items-center gap-2"><ScanLine className="w-3 h-3" /> Scanner</span>
              </div>
              
              <div className="relative p-4 md:p-6 flex justify-center items-center h-24 md:h-32 bg-slate-50 dark:bg-slate-900 overflow-hidden">
                <QrCode className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground opacity-50" />
                <motion.div 
                  className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              </div>

              <div className="p-3 md:p-4 bg-green-500/10 border-t border-green-500/20">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Entry Verified</span>
                </div>
                <p className="text-xs md:text-sm font-semibold">Rahul Sharma</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">General Admission</p>
              </div>
            </motion.div>

            {/* Small Floating Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, delay: 1 }}
              className="hidden sm:flex absolute -left-2 md:-left-8 lg:-left-12 top-10 md:top-16 z-10 bg-background border border-border rounded-lg shadow-lg p-2 md:p-3 items-center gap-2 md:gap-3"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Check className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-semibold">QR Generated</span>
                <span className="text-[8px] md:text-[10px] text-muted-foreground">For 1,248 guests</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, delay: 2 }}
              className="hidden sm:flex absolute left-2 md:left-4 -bottom-4 md:-bottom-6 z-10 bg-background border border-border rounded-lg shadow-lg p-2 md:p-3 items-center gap-2 md:gap-3"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <Activity className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-semibold">Live Sync</span>
                <span className="text-[8px] md:text-[10px] text-muted-foreground">Google Sheets Connected</span>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}
