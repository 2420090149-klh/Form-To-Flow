"use client"

import { motion } from "framer-motion"
import { QrCode, Users, FileSpreadsheet, Activity, BarChart3, Cloud } from "lucide-react"

export function Features() {
  const features = [
    {
      title: "QR Code Generation",
      description: "Generate unique QR passes automatically.",
      icon: QrCode
    },
    {
      title: "Guest Management",
      description: "Keep your attendee list organized and accessible.",
      icon: Users
    },
    {
      title: "Excel Import",
      description: "Upload existing guest lists instantly.",
      icon: FileSpreadsheet
    },
    {
      title: "Google Sheets",
      description: "Connect your existing spreadsheet workflow.",
      icon: Cloud
    },
    {
      title: "Live Check-in",
      description: "Track attendance as it happens.",
      icon: Activity
    },
    {
      title: "Analytics",
      description: "Understand attendance and entry patterns.",
      icon: BarChart3
    }
  ]

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-colors group cursor-default flex flex-col"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
