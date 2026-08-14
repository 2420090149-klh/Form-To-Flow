import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { PlusCircle, Search, Calendar as CalendarIcon, Users, MoreHorizontal } from "lucide-react"

export default async function EventsPage() {
  const session = await auth()
  
  if (!session?.user?.id) return null

  // Fetch events
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage all your upcoming and past events.</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-background/60 backdrop-blur-md border border-border/40 p-2 rounded-lg shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0" />
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 backdrop-blur-sm p-8 text-center animate-in fade-in zoom-in-95 duration-1000">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 animate-[bounce_3s_ease-in-out_infinite]">
              <CalendarIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No events found</h2>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't created any events yet. Get started by setting up your first event.
            </p>
            <Link href="/dashboard/events/new">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Create Event</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <div 
              key={event.id}
              className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms`, animationDuration: '500ms' }}
            >
              <Card className="h-full min-h-[14rem] flex flex-col hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group overflow-hidden relative bg-background/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link href={`/dashboard/events/${event.id}`}>
                        <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">{event.title}</CardTitle>
                      </Link>
                      <CardDescription className="text-sm mt-1 flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {event.date ? new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "No date set"}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 mt-auto pt-4 flex flex-col gap-4">
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {event.location || "No location set"}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-border/40 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {event._count.attendees}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="h-8 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-colors">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
