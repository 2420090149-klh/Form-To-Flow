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
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-4xl font-extrabold tracking-tight">Your Events</h1>
        <Link href="/dashboard/events/new">
          <Button size="lg" className="text-lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-background p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mb-4">
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">No events created</h2>
            <p className="mb-4 mt-2 text-sm text-gray-500">
              You don't have any events yet. Create one to start managing attendees and passes.
            </p>
            <Link href="/dashboard/events/new">
              <Button size="lg">Create Event</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}>
              <Card className="h-full min-h-[12rem] flex flex-col justify-between cursor-pointer transition-all hover:border-primary hover:shadow-lg dark:hover:shadow-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="text-base">
                    {event.date ? new Date(event.date).toLocaleDateString() : "No date set"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-2">
                    {event.location || "No location set"}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {event._count.attendees} Attendees
                    </span>
                    {event.ownerId === session?.user?.id ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Owner
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        Team Member
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
