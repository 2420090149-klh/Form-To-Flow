import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addTeamMember, removeTeamMember } from "@/app/actions/team"

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return null

  const resolvedParams = await params

  const event = await prisma.event.findFirst({
    where: { id: resolvedParams.id, ownerId: session.user.id },
    include: {
      teamMembers: {
        include: { user: true }
      }
    }
  })

  if (!event) return notFound() // or unauthorized if they are a team member but not owner

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
          <CardDescription>
            Invite event managers or check-in staff (scanners). To update an existing member's role, simply re-invite them with the new role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addTeamMember} className="flex flex-col sm:flex-row gap-4 items-end">
            <input type="hidden" name="eventId" value={event.id} />
            <div className="space-y-2 flex-1">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="colleague@example.com" required />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="SCANNER">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCANNER">Scanner (Can only check-in)</SelectItem>
                  <SelectItem value="MANAGER">Manager (Full control)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Send Invite</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{session.user.name || "You"}</TableCell>
                <TableCell>{session.user.email}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    OWNER
                  </span>
                </TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              {event.teamMembers.map((tm) => (
                <TableRow key={tm.id}>
                  <TableCell className="font-medium">{tm.user.name}</TableCell>
                  <TableCell>{tm.user.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                      {tm.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={removeTeamMember.bind(null, event.id, tm.userId)}>
                      <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        Remove
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
