import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

    const resolvedParams = await params
    const eventId = resolvedParams.id
    const { ticketCode } = await req.json()

    if (!ticketCode) return new Response("Ticket Code is required", { status: 400 })

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { ownerId: session.user.id },
          { teamMembers: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!event) return new Response("Forbidden", { status: 403 })

    const attendee = await prisma.attendee.findFirst({
      where: { eventId, ticketCode },
      include: { checkedInBy: true }
    })

    if (!attendee) {
      return new Response(JSON.stringify({ status: "invalid", message: "Ticket Not Found" }), { status: 200 })
    }

    // MULTI-DAY CHECK-IN LOGIC
    // Extract today's UTC date in YYYY-MM-DD format to ensure consistency
    const today = new Date().toISOString().split('T')[0];
    
    // Parse existing history
    let history: string[] = [];
    if (attendee.checkInHistory) {
      try {
        history = JSON.parse(attendee.checkInHistory);
      } catch (e) {
        history = [];
      }
    }

    if (history.includes(today)) {
      return new Response(JSON.stringify({ 
        status: "already_scanned", 
        message: `Already Checked-In today at ${attendee.checkedInAt?.toLocaleTimeString()} by ${attendee.checkedInBy?.name || 'Staff'}` 
      }), { status: 200 })
    }

    // Add today to history
    history.push(today);

    // Mark as checked in
    await prisma.attendee.update({
      where: { id: attendee.id },
      data: {
        checkInStatus: true,
        checkedInAt: new Date(),
        checkInHistory: JSON.stringify(history),
        checkedInByUserId: session.user.id
      }
    })

    return new Response(JSON.stringify({ 
      status: "success", 
      message: `Checked-in ${attendee.name} for Day ${history.length}`,
      attendee: {
        name: attendee.name,
        email: attendee.email
      }
    }), { status: 200 })
  } catch (error) {
    console.error("Scan error:", error)
    return new Response("Internal Error", { status: 500 })
  }
}
