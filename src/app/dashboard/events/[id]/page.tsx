import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Upload, FileImage, Send, Users, QrCode, Shield, Activity, Calendar, Settings, MapPin } from "lucide-react"
import { DeleteEventButton } from "./delete-button"
import { EventSettingsCard } from "@/components/EventSettingsCard"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return null

  const resolvedParams = await params

  const event = await prisma.event.findFirst({
    where: {
      id: resolvedParams.id,
      OR: [
        { ownerId: session.user.id },
        { teamMembers: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      owner: true,
      _count: {
        select: { attendees: true }
      }
    }
  })

  if (!event) return notFound()

  const quickActions = [
    { title: "Guests", icon: <Users className="h-4 w-4" />, href: `/dashboard/events/${event.id}/attendees` },
    { title: "Import Data", icon: <Upload className="h-4 w-4" />, href: `/dashboard/events/${event.id}/upload` },
    { title: "Templates", icon: <FileImage className="h-4 w-4" />, href: `/dashboard/events/${event.id}/templates` },
    { title: "Dispatch", icon: <Send className="h-4 w-4" />, href: `/dashboard/events/${event.id}/dispatch` },
    { title: "Team", icon: <Shield className="h-4 w-4" />, href: `/dashboard/events/${event.id}/team` },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      
      {/* Event Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/40">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {event.title}
            </h1>
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              Active
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {event.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "No date set"}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {event.location || "No location set"}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/events/${event.id}/scan`} target="_blank">
            <Button size="lg" className="bg-gradient-to-r from-primary to-indigo-500 hover:opacity-90 shadow-lg shadow-primary/25 transition-all">
              <QrCode className="mr-2 h-5 w-5" /> Open Scanner
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-background/60 backdrop-blur-md border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{event._count.attendees}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 mb-4">
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-emerald-500">{Math.floor(event._count.attendees * 0.4)}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 mb-4">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-amber-500">{event._count.attendees - Math.floor(event._count.attendees * 0.4)}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 mb-4">
              <p className="text-sm font-medium text-muted-foreground">Passes Generated</p>
              <QrCode className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-3xl font-bold text-indigo-500">{event._count.attendees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tools & Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-background/60 backdrop-blur-md border-border/40 h-full">
            <CardHeader>
              <CardTitle>Management Tools</CardTitle>
              <CardDescription>Configure and manage your event operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, i) => (
                  <Link key={i} href={action.href}>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-background/50 hover:bg-primary/5 hover:border-primary/30 transition-all group cursor-pointer h-full">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {action.icon}
                      </div>
                      <div className="font-medium">{action.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-background/60 backdrop-blur-md border-border/40">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-8">
                Connect verification module to see live activity.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Section */}
      <div className="pt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" /> Event Configuration
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {session.user.id === event.ownerId && (
            <EventSettingsCard event={event} />
          )}

          {session.user.id === event.ownerId && (
            <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions for this event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-background/50">
                  <div>
                    <h4 className="font-medium text-foreground">Delete Event</h4>
                    <p className="text-sm text-muted-foreground">Permanently remove this event and all data.</p>
                  </div>
                  <DeleteEventButton eventId={event.id} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>
  )
}
