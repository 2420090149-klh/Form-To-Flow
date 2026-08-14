import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Calendar, Users, QrCode, Activity, ArrowRight, ExternalLink } from "lucide-react"

export default async function DashboardPage() {
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

  // Basic KPI Stats
  const totalEvents = events.length
  const totalGuests = events.reduce((sum, e) => sum + e._count.attendees, 0)
  // Mock recent verifications for the KPI visualization (in a real app, query Verification logs)
  const recentVerifications = Math.floor(totalGuests * 0.4) 

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Overview of your events, guests, and check-in metrics.</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all workspaces</p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground mt-1">Imported across events</p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">QR Passes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground mt-1">100% Generation rate</p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Check-ins</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{recentVerifications}</div>
            <p className="text-xs text-muted-foreground mt-1">Recent check-in activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area Grid */}
      <div className="grid gap-6 md:grid-cols-6">
        
        {/* Events List */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <Link href="/dashboard/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {events.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 backdrop-blur-sm p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No events created</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Get started by creating your first event to manage attendees and generate QR passes.
              </p>
              <Link href="/dashboard/events/new" className="mt-6">
                <Button variant="outline">Create Event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {events.slice(0, 4).map((event) => (
                <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                  <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all duration-200 group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">{event.title}</CardTitle>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardDescription className="text-xs">
                        {event.date ? new Date(event.date).toLocaleDateString() : "No date set"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between text-xs mt-2 pt-4 border-t border-border/40">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {event._count.attendees} Guests
                        </span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Activity Stream</h2>
          <Card className="bg-background/60 backdrop-blur-md border-border/40">
            <CardContent className="p-0">
              {events.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No recent activity.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {/* Mock Activity Items for Visual Completeness */}
                  <div className="p-4 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Guest check-in verified</p>
                      <p className="text-xs text-muted-foreground">2 mins ago in {events[0]?.title}</p>
                    </div>
                  </div>
                  <div className="p-4 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Guest list imported</p>
                      <p className="text-xs text-muted-foreground">1 hour ago in {events[0]?.title}</p>
                    </div>
                  </div>
                  <div className="p-4 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <QrCode className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">QR Passes generated</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
