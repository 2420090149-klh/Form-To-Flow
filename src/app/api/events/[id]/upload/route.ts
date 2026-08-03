import { NextResponse } from "next-auth/next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const resolvedParams = await params
    const eventId = resolvedParams.id
    
    // Verify permission
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { ownerId: session.user.id },
          { teamMembers: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!event) {
      return new Response("Forbidden", { status: 403 })
    }

    const { attendees } = await req.json()

    if (!Array.isArray(attendees)) {
      return new Response("Invalid data", { status: 400 })
    }

    const createData = attendees.map(att => {
      // Generate a simple random alphanumeric ticket code (e.g. 8 chars)
      const ticketCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      return {
        eventId,
        name: att.name,
        email: att.email,
        phone: att.phone,
        customData: att.customData,
        ticketCode
      }
    })

    // Insert attendees (Prisma createMany is supported on SQLite from v4+, but skipDuplicates is not)
    const result = await prisma.attendee.createMany({
      data: createData,
    })

    return new Response(JSON.stringify({ count: result.count }), { status: 200 })
  } catch (error) {
    console.error("Upload error:", error)
    return new Response("Internal Error", { status: 500 })
  }
}
