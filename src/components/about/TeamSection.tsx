"use client"

import { motion } from "framer-motion"
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
    role: "Lead Product Engineer",
    description: "Building the technology and product experience behind FormToFlow.",
    linkedinUrl: "#", // Placeholder
    githubUrl: "https://github.com/2420090149-klh",
  },
  {
    name: "B Deepak",
    role: "Frontend & UI Developer",
    description: "Crafting intuitive user interfaces and seamless event workflows.",
    linkedinUrl: "https://www.linkedin.com/in/deepak-botla-36124631b",
    githubUrl: "#", // Placeholder
  },
  {
    name: "D Ruchit",
    role: "Backend & Systems Developer",
    description: "Architecting reliable data pipelines and secure check-in systems.",
    linkedinUrl: "https://www.linkedin.com/in/ruchit-dwara-560210365",
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </Link>
                    <Link 
                      href={member.githubUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s GitHub`}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
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
