"use client"

import { useState, useEffect, use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Loader2, Download, RefreshCw, Users, Search } from "lucide-react"
import { deleteAttendees } from "@/app/actions/attendee"
import { Input } from "@/components/ui/input"
import * as xlsx from "xlsx"

export default function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const eventId = unwrappedParams.id

  const [attendees, setAttendees] = useState<any[]>([])
  const [event, setEvent] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState("")

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

  const filteredAttendees = attendees.filter(a => 
    a.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.ticketCode?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleAll = () => {
    if (selectedIds.size === filteredAttendees.length && filteredAttendees.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAttendees.map(a => a.id)))
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
        College: (() => {
          if (!att.customData) return "N/A"
          try {
            const data: any = typeof att.customData === 'string' ? JSON.parse(att.customData) : att.customData
            const collegeKey = Object.keys(data).find(k => /college|university|school|institution|organization/i.test(k))
            return collegeKey ? (data[collegeKey] || "N/A") : "N/A"
          } catch(e){ return "N/A" }
        })(),
        "Team Name": att.teamName || "None",
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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Guest List
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and monitor all your registered event attendees.</p>
        </div>
      </div>

      <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search guests by name, email, or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border/60 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAttendees} disabled={loading} className="h-9">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={attendees.length === 0} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {selectedIds.size > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="h-9"
              >
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-auto max-h-[600px] relative">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md z-10 border-b border-border/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] pl-4">
                  <Checkbox 
                    checked={filteredAttendees.length > 0 && selectedIds.size === filteredAttendees.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-bold text-foreground">Name</TableHead>
                <TableHead className="font-bold text-foreground">Email</TableHead>
                <TableHead className="font-bold text-foreground">Phone</TableHead>
                <TableHead className="font-bold text-foreground">College</TableHead>
                <TableHead className="font-bold text-foreground">Team Name</TableHead>
                <TableHead className="font-bold text-foreground">Ticket Code</TableHead>
                {event && event.date && event.durationDays > 0 ? (
                  Array.from({ length: event.durationDays }).map((_, i) => {
                    const d = new Date(event.date);
                    d.setUTCDate(d.getUTCDate() + i);
                    return <TableHead key={i} className="font-bold text-foreground">Day {i + 1} <span className="text-xs font-normal opacity-70 ml-1">({d.toLocaleDateString(undefined, {month: 'short', day:'numeric'})})</span></TableHead>
                  })
                ) : (
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading guests...</p>
                  </TableCell>
                </TableRow>
              ) : filteredAttendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    {search ? "No guests found matching your search." : "No attendees found. Import some data to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendees.map(att => (
                  <TableRow 
                    key={att.id} 
                    className={`group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50 ${selectedIds.has(att.id) ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                  >
                    <TableCell className="pl-4">
                      <Checkbox 
                        checked={selectedIds.has(att.id)}
                        onCheckedChange={() => toggleOne(att.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{att.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{att.email || <span className="italic opacity-50">N/A</span>}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{att.phone || <span className="italic opacity-50">N/A</span>}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {(() => {
                        let college = "N/A"
                        if (att.customData) {
                          try {
                            const data: any = typeof att.customData === 'string' ? JSON.parse(att.customData) : att.customData
                            const collegeKey = Object.keys(data).find(k => /college|university|school|institution|organization/i.test(k))
                            if (collegeKey && data[collegeKey]) college = data[collegeKey]
                          } catch(e){}
                        }
                        return college
                      })()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{att.teamName || <span className="italic opacity-50">None</span>}</TableCell>
                    <TableCell>
                      <code className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md text-xs font-bold tracking-wide">
                        {att.ticketCode}
                      </code>
                    </TableCell>
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
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-medium bg-amber-500/10 px-2 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                              </span>
                            )}
                          </TableCell>
                        )
                      })
                    ) : (
                      <TableCell>
                        {att.checkInStatus ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-medium bg-amber-500/10 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
