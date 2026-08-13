"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"

export function EventNav({ eventId, eventTitle }: { eventId: string, eventTitle: string }) {
  const pathname = usePathname()
  const isRoot = pathname === `/dashboard/events/${eventId}`

  return (
    <div className="sticky top-16 z-20 w-full backdrop-blur-xl bg-background/70 border-b border-white/10 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-12 flex items-center gap-2">
        {isRoot ? (
          <Link 
            href="/dashboard" 
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        ) : (
          <Link 
            href={`/dashboard/events/${eventId}`} 
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Event
          </Link>
        )}
        
        {!isRoot && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
              {pathname.split('/').pop()?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
