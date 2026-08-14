"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, User, Clock } from "lucide-react"

type ActivityItem = {
  id: number
  name: string
  time: string
}

const allNames = [
  "Rahul Sharma", "Ananya Rao", "Arjun Kumar", "Priya Singh",
  "Vikram Patel", "Neha Gupta", "Karan Desai", "Sneha Reddy"
]

export function LiveCheckIn() {

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 1, name: "Rahul Sharma", time: "10:42:03" },
    { id: 2, name: "Ananya Rao", time: "10:42:07" },
  ])
  const [checkedIn, setCheckedIn] = useState(1103)
  const totalGuests = 1248

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const newId = prev.length > 0 ? prev[0].id + 1 : 1
        const randomName = allNames[Math.floor(Math.random() * allNames.length)]
        
        const now = new Date()
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        
        const newActivity = { id: newId, name: randomName, time: timeString }
        
        // Keep only the latest 4 activities
        const next = [newActivity, ...prev].slice(0, 4)
        return next
      })

      setCheckedIn(prev => Math.min(prev + 1, totalGuests))
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  const percentage = ((checkedIn / totalGuests) * 100).toFixed(1)
  const remaining = totalGuests - checkedIn

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              Watch your event fill up in real time.
            </h2>
            <p className="text-lg text-muted-foreground">
              As guests scan their QR passes at the door, your dashboard updates instantly. Know exactly who is in the building and how many people are left to arrive.
            </p>
          </motion.div>

          {/* Simulated Dashboard */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-muted/30 border-b border-border p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">TechFest 2026</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md mt-1 inline-block uppercase font-semibold">Live Dashboard Demo</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </div>
            </div>

            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/30 p-4 rounded-xl flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium uppercase mb-1">Total Guests</span>
                  <span className="text-2xl font-black">{totalGuests.toLocaleString()}</span>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col">
                  <span className="text-xs text-primary font-medium uppercase mb-1">Checked In</span>
                  <span className="text-2xl font-black text-primary">{checkedIn.toLocaleString()}</span>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium uppercase mb-1">Remaining</span>
                  <span className="text-2xl font-black">{remaining.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Attendance</span>
                  <span className="text-primary">{percentage}%</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                  <ActivityIcon /> Recent Activity
                </h4>
                <div className="flex flex-col gap-3">
                  <AnimatePresence>
                    {activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="font-semibold">{activity.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                            <User className="w-3 h-3" /> Checked in
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {activity.time}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  )
}
