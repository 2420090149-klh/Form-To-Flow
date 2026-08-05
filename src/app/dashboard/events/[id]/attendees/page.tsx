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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const fetchAttendees = () => {
    setLoading(true)
    fetch(`/api/events/${eventId}/stats`)
      .then(res => res.json())
      .then(data => {
        setAttendees(data.attendees || [])
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
      let daysCheckedIn = 0
      if (att.checkInHistory) {
        try {
          const history = JSON.parse(att.checkInHistory)
          daysCheckedIn = Array.isArray(history) ? history.length : 0
        } catch (e) {
          // fallback
        }
      } else if (att.checkInStatus) {
        daysCheckedIn = 1
      }

      return {
        Name: att.name,
        Email: att.email || "",
        Phone: att.phone || "",
        "Ticket Code": att.ticketCode,
        "Check-In Status": att.checkInStatus ? "Checked In" : "Pending",
        "Days Attended": daysCheckedIn,
        "Last Check-In Time": att.checkedInAt ? new Date(att.checkedInAt).toLocaleString() : "",
      }
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
            <CardTitle>Attendees List</CardTitle>
            <CardDescription>View all registered attendees and manage their records.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
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
                      <TableCell>
                        {att.checkInStatus ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-green-600 text-[10px] font-semibold bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Checked In
                            </span>
                            {att.checkInHistory && (
                              <span className="text-xs text-gray-500">
                                {(() => {
                                  try {
                                    const h = JSON.parse(att.checkInHistory);
                                    return Array.isArray(h) ? `(${h.length} Days)` : '';
                                  } catch (e) {
                                    return '';
                                  }
                                })()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-full">Pending</span>
                        )}
                      </TableCell>
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
