"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Send } from "lucide-react"

export default function DispatchPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [stats, setStats] = useState({ total: 0, sent: 0 })
  const [attendees, setAttendees] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dispatching, setDispatching] = useState(false)
  const [groupLink, setGroupLink] = useState("")
  
  const fetchStats = () => {
    fetch(`/api/events/${unwrappedParams.id}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({ total: data.total, sent: data.sent })
        setAttendees(data.attendees || [])
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchStats()
  }, [unwrappedParams.id])

  const toggleAll = () => {
    if (selectedIds.size === attendees.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(attendees.map(a => a.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleDispatch = async () => {
    setDispatching(true)
    try {
      const res = await fetch(`/api/events/${unwrappedParams.id}/dispatch`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeIds: Array.from(selectedIds), groupLink: groupLink.trim() || undefined })
      })
      
      if (res.ok) {
        alert("Dispatch started successfully!")
        const data = await res.json()
        setStats(prev => ({ ...prev, sent: prev.sent + data.sentCount }))
        setSelectedIds(new Set()) // clear selection after sending
      } else {
        alert("Failed to dispatch")
      }
    } catch (err) {
      console.error(err)
      alert("Error dispatching emails")
    } finally {
      setDispatching(false)
    }
  }

  const progress = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Dispatch</CardTitle>
          <CardDescription>Send generated passes and QR codes to your attendees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Attendees</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Emails Sent</p>
              <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="rounded-md border mt-8 max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={attendees.length > 0 && selectedIds.size === attendees.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ticket Code</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map(att => (
                  <TableRow key={att.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(att.id)}
                        onCheckedChange={() => toggleOne(att.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{att.name}</TableCell>
                    <TableCell>{att.email}</TableCell>
                    <TableCell><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{att.ticketCode}</code></TableCell>
                    <TableCell>
                      {att.checkInStatus ? (
                        <span className="text-green-600 text-xs font-semibold">Checked In</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {attendees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No attendees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label htmlFor="groupLink" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Optional Group Link
              </label>
              <input 
                id="groupLink"
                type="url"
                placeholder="https://chat.whatsapp.com/..." 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={groupLink}
                onChange={(e) => setGroupLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Add a WhatsApp, Discord, or Telegram group link to include in the pass emails.</p>
            </div>
          </div>

          <Button 
            onClick={handleDispatch} 
            disabled={dispatching || stats.total === 0 || selectedIds.size === 0} 
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {dispatching ? "Dispatching..." : `Dispatch Emails to ${selectedIds.size} selected`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
