import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EventNav } from "./event-nav"

export default async function EventLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: Promise<{ id: string }>
}) {
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
    select: {
      id: true,
      title: true
    }
  })

  if (!event) return notFound()

  return (
    <div className="flex flex-col w-full h-full">
      <EventNav eventId={event.id} eventTitle={event.title} />
      <div className="flex-1 w-full mt-4">
        {children}
      </div>
    </div>
  )
}
