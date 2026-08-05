"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Loader2, ArrowLeft } from "lucide-react"
import { deleteAttendees } from "@/app/actions/attendee"
import Link from "next/link"
import * as xlsx from "xlsx"

export default function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const eventId = unwrappedParams.id

  const [attendees, setAttendees] = useState<any[]>([])
  const [event, setEvent] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const fetchAttendees = () => {
    setLoading(true)
    fetch(`/api/events/${eventId}/stats?_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setAttendees(data.attendees || [])
        setEvent(data.event || null)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAttendees()
  }, [eventId])

  const toggleAll = () => {
    if (selectedIds.size === attendees.length && attendees.length > 0) {
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

  const handleDelete = async () => {
    if (selectedIds.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} attendee(s)? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteAttendees(eventId, Array.from(selectedIds))
      // Clear selection and refresh list
      setSelectedIds(new Set())
      fetchAttendees()
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to delete attendees")
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = () => {
    if (attendees.length === 0) return alert("No attendees to export.")
    
    const exportData = attendees.map(att => {
      let history: string[] = []
      if (att.checkInHistory) {
        try {
          const parsed = JSON.parse(att.checkInHistory)
          if (Array.isArray(parsed)) history = parsed
        } catch (e) {}
      }

      const row: any = {
        Name: att.name,
        Email: att.email || "",
        Phone: att.phone || "",
        "Ticket Code": att.ticketCode,
      }

      if (event && event.date && event.durationDays > 0) {
        const startDate = new Date(event.date)
        for (let i = 0; i < event.durationDays; i++) {
          const dayDate = new Date(startDate)
          dayDate.setUTCDate(startDate.getUTCDate() + i)
          const dateStr = dayDate.toISOString().split('T')[0]
          row[`Day ${i + 1} (${dateStr})`] = history.includes(dateStr) ? "Yes" : "No"
        }
      } else {
        row["Check-In Status"] = att.checkInStatus ? "Checked In" : "Pending"
      }
      
      row["Total Days Attended"] = history.length || (att.checkInStatus ? 1 : 0)
      if (att.checkedInAt) row["Last Check-In Time"] = new Date(att.checkedInAt).toLocaleString()
      
      return row
    })

    const worksheet = xlsx.utils.json_to_sheet(exportData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Attendees")
    xlsx.writeFile(workbook, `Attendees_Event_${eventId}.xlsx`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Attendee Management</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Attendees List
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CardDescription>View all registered attendees. Updates automatically.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchAttendees} disabled={loading}>
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={attendees.length === 0}>
              Export to Excel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={selectedIds.size === 0 || deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Selected ({selectedIds.size})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={attendees.length > 0 && selectedIds.size === attendees.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Ticket Code</TableHead>
                  {event && event.date && event.durationDays > 0 ? (
                    Array.from({ length: event.durationDays }).map((_, i) => {
                      const d = new Date(event.date);
                      d.setUTCDate(d.getUTCDate() + i);
                      return <TableHead key={i}>Day {i + 1} <span className="text-[10px] font-normal text-gray-500">({d.toISOString().split('T')[0]})</span></TableHead>
                    })
                  ) : (
                    <TableHead>Status</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && attendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : attendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No attendees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  attendees.map(att => (
                    <TableRow key={att.id} className={selectedIds.has(att.id) ? "bg-blue-50/50" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.has(att.id)}
                          onCheckedChange={() => toggleOne(att.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{att.name}</TableCell>
                      <TableCell>{att.email || <span className="text-gray-400 italic">N/A</span>}</TableCell>
                      <TableCell>{att.phone || <span className="text-gray-400 italic">N/A</span>}</TableCell>
                      <TableCell><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{att.ticketCode}</code></TableCell>
                      {event && event.date && event.durationDays > 0 ? (
                        Array.from({ length: event.durationDays }).map((_, i) => {
                          const d = new Date(event.date);
                          d.setUTCDate(d.getUTCDate() + i);
                          const dateStr = d.toISOString().split('T')[0];
                          let history: string[] = []
                          if (att.checkInHistory) {
                            try { history = JSON.parse(att.checkInHistory) } catch(e){}
                          }
                          const didAttend = history.includes(dateStr);
                          return (
                            <TableCell key={i}>
                              {didAttend ? (
                                <span className="text-green-600 text-[10px] font-semibold bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Checked In</span>
                              ) : (
                                <span className="text-gray-400 text-[10px] uppercase bg-gray-50 px-2 py-0.5 rounded-full">Pending</span>
                              )}
                            </TableCell>
                          )
                        })
                      ) : (
                        <TableCell>
                          {att.checkInStatus ? (
                            <span className="text-green-600 text-[10px] font-semibold bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Checked In</span>
                          ) : (
                            <span className="text-gray-400 text-[10px] uppercase bg-gray-50 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
