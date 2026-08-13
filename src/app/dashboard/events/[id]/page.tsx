import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Upload, FileImage, Send, Users, QrCode, Shield } from "lucide-react"
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

  const actions = [
    {
      title: "Attendees",
      description: "Manage and view all registered attendees",
      icon: <Users className="h-6 w-6 text-indigo-500" />,
      href: `/dashboard/events/${event.id}/attendees`
    },
    {
      title: "Upload Data",
      description: "Upload CSV/Excel with attendee details",
      icon: <Upload className="h-6 w-6 text-blue-500" />,
      href: `/dashboard/events/${event.id}/upload`
    },
    {
      title: "Pass Templates",
      description: "Design custom passes with QR codes",
      icon: <FileImage className="h-6 w-6 text-purple-500" />,
      href: `/dashboard/events/${event.id}/templates`
    },
    {
      title: "Email Dispatch",
      description: "Send generated passes to attendees",
      icon: <Send className="h-6 w-6 text-green-500" />,
      href: `/dashboard/events/${event.id}/dispatch`
    },
    {
      title: "Team Members",
      description: "Manage event staff and scanners",
      icon: <Shield className="h-6 w-6 text-orange-500" />,
      href: `/dashboard/events/${event.id}/team`
    },
    {
      title: "QR Scanner",
      description: "Open mobile camera scanner",
      icon: <QrCode className="h-6 w-6 text-red-500" />,
      href: `/events/${event.id}/scan`,
      external: true
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute -z-10 -top-20 -left-20 w-72 h-72 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -z-10 top-40 -right-20 w-72 h-72 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-sm">
            {event.title}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {event.date ? new Date(event.date).toLocaleDateString() : "No date"} • {event.location || "No location"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}/scan`} target="_blank">
            <Button variant="outline" className="border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_-3px_rgba(99,102,241,0.4)]">
              <QrCode className="mr-2 h-4 w-4 text-indigo-500" /> Open Scanner
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, i) => (
          <Link key={i} href={action.href} target={action.external ? "_blank" : undefined}>
            <Card className="h-full group relative overflow-hidden backdrop-blur-xl bg-background/60 border-white/10 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center gap-4 relative z-10">
                <div className="p-3 bg-background shadow-inner rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/5">
                  {action.icon}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 transition-all">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">Event Overview</CardTitle>
          <CardDescription>Quick stats for this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground font-medium">Total Attendees</p>
              <p className="text-3xl font-extrabold text-foreground">{event._count.attendees}</p>
            </div>
            <div className="space-y-1 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground font-medium">Owner</p>
              <p className="text-lg font-semibold truncate text-foreground">{event.owner.name || event.owner.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Registration Settings */}
      {session.user.id === event.ownerId && (
        <EventSettingsCard event={event} />
      )}

      {session.user.id === event.ownerId && (
        <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(239,68,68,0.1)]">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-red-500/80">
              Irreversible destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteEventButton eventId={event.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
