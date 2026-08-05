import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createEvent } from "@/app/actions/event"
import { SubmitButton } from "./submit-button"

export default function CreateEventPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in the details for your new event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Annual Tech Conference" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Brief details about the event" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Start Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input id="durationDays" name="durationDays" type="number" min="1" max="14" defaultValue="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g. Grand Hall" />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
