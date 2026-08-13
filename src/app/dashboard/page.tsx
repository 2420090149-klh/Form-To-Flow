import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Calendar } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) return null

  // Fetch events where user is owner or team member
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        {
          teamMembers: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    },
    include: {
      owner: true,
      _count: {
        select: { attendees: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Your Events</h1>
        <Link href="/dashboard/events/new" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-300">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-background/50 backdrop-blur-sm p-8 text-center animate-in fade-in zoom-in-95 duration-1000">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 animate-[bounce_3s_ease-in-out_infinite]">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No events created</h2>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You don't have any events yet. Create one to start managing attendees and passes.
            </p>
            <Link href="/dashboard/events/new">
              <Button size="lg" className="bg-primary/20 text-primary hover:bg-primary/30">Create Event</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <div 
              key={event.id}
              className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${index * 150}ms`, animationDuration: '700ms' }}
            >
              <Link href={`/dashboard/events/${event.id}`} className="block h-full">
                <Card className="h-full min-h-[12rem] flex flex-col justify-between cursor-pointer transition-all duration-300 border-white/10 backdrop-blur-xl bg-background/60 hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)] hover:border-primary/50 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">{event.title}</CardTitle>
                    <CardDescription className="text-base">
                      {event.date ? new Date(event.date).toLocaleDateString() : "No date set"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-sm text-muted-foreground mb-4">
                      {event.location || "No location set"}
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                        {event._count.attendees} Attendees
                      </span>
                      {event.ownerId === session?.user?.id ? (
                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">
                          Owner
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary ring-1 ring-inset ring-secondary/20">
                          Team Member
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
