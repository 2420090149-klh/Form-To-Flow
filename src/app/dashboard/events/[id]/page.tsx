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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-gray-500 mt-1">
            {event.date ? new Date(event.date).toLocaleDateString() : "No date"} • {event.location || "No location"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}/scan`} target="_blank">
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" /> Open Scanner
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, i) => (
          <Link key={i} href={action.href} target={action.external ? "_blank" : undefined}>
            <Card className="h-full hover:border-blue-500 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {action.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Overview</CardTitle>
          <CardDescription>Quick stats for this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">Total Attendees</p>
              <p className="text-2xl font-bold">{event._count.attendees}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">Owner</p>
              <p className="text-lg">{event.owner.name || event.owner.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Registration Settings */}
      {session.user.id === event.ownerId && (
        <EventSettingsCard event={event} />
      )}

      {session.user.id === event.ownerId && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription className="text-red-600/80">
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
