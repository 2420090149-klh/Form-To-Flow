"use client"

import { motion } from "framer-motion"
import { Github, Linkedin } from "lucide-react"
import Link from "next/link"

type TeamMember = {
  name: string
  role: string
  description: string
  imageUrl?: string
  linkedinUrl: string
  githubUrl: string
}

const team: TeamMember[] = [
  {
    name: "K Dheeran",
    role: "Product & Full-Stack Developer",
    description: "Building the technology and product experience behind FormToFlow.",
    linkedinUrl: "#", // Placeholder
    githubUrl: "#", // Placeholder
  }
]

export function TeamSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Meet the Team Behind FormToFlow
            </h2>
            <p className="text-lg text-muted-foreground">
              FormToFlow is built by people who believe event technology should make things simpler, not more complicated.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-full max-w-md group"
            >
              <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20">
                {/* Subtle Hover Glow Inside Card */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/0 group-hover:bg-primary/5 rounded-full blur-2xl transition-colors duration-500" />
                
                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Profile Photo */}
                  <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/30 transition-colors duration-300 relative shadow-sm">
                    {member.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-muted-foreground group-hover:scale-105 transition-transform duration-500">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-[280px]">
                    &quot;{member.description}&quot;
                  </p>

                  <div className="flex items-center gap-4">
                    <Link 
                      href={member.linkedinUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s LinkedIn`}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={member.githubUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s GitHub`}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                    >
                      <Github className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
