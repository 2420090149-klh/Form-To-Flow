"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Mail, Users, CheckCircle2, Link2, MapPin, MessageSquare, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function DispatchPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [stats, setStats] = useState({ total: 0, sent: 0 })
  const [attendees, setAttendees] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dispatching, setDispatching] = useState(false)
  const [groupLink, setGroupLink] = useState("")
  const [locationLink, setLocationLink] = useState("")
  const [note, setNote] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  
  const fetchStats = () => {
    setLoading(true)
    fetch(`/api/events/${unwrappedParams.id}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({ total: data.total || 0, sent: data.sent || 0 })
        setAttendees(data.attendees || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchStats()
  }, [unwrappedParams.id])

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

  const handleDispatch = async () => {
    setDispatching(true)
    try {
      const res = await fetch(`/api/events/${unwrappedParams.id}/dispatch`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          attendeeIds: Array.from(selectedIds), 
          groupLink: groupLink.trim() || undefined,
          locationLink: locationLink.trim() || undefined,
          note: note.trim() || undefined
        })
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary" />
            Email Dispatch
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Send generated QR passes and event details to your guests.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-900/50 items-center">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search guests to send..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background border-border/60 shadow-sm"
                />
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                <span className="text-primary">{selectedIds.size}</span> selected
              </div>
            </div>

            <div className="max-h-[500px] overflow-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/40 shadow-sm">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] pl-4">
                      <Checkbox 
                        checked={filteredAttendees.length > 0 && selectedIds.size === filteredAttendees.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-foreground/80">Guest</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Ticket</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading list...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredAttendees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                        {search ? "No guests found matching your search." : "No attendees to dispatch."}
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
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{att.name}</span>
                            <span className="text-xs text-muted-foreground">{att.email || "No email"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-md text-xs font-medium tracking-wide">
                            {att.ticketCode}
                          </code>
                        </TableCell>
                        <TableCell>
                          {att.checkInStatus ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-medium bg-amber-500/10 px-2 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Sidebar Actions & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Dispatch Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Total Guests</span>
                  </div>
                  <p className="text-3xl font-black tracking-tight">{stats.total}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Sent</span>
                  </div>
                  <p className="text-3xl font-black tracking-tight text-emerald-600">{stats.sent}</p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Link2 className="w-4 h-4 text-muted-foreground" /> Group Link
                </Label>
                <Input 
                  type="url"
                  placeholder="e.g. WhatsApp, Discord..." 
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-muted-foreground" /> Location Link
                </Label>
                <Input 
                  type="url"
                  placeholder="e.g. Google Maps URL..." 
                  value={locationLink}
                  onChange={(e) => setLocationLink(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" /> Custom Note
                </Label>
                <Textarea
                  placeholder="Add a custom message to your attendees..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-background min-h-[80px]"
                />
              </div>

            </CardContent>
            <div className="p-4 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
              <Button 
                onClick={handleDispatch} 
                disabled={dispatching || selectedIds.size === 0} 
                className="w-full bg-primary hover:opacity-90 shadow-md h-11"
              >
                {dispatching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {dispatching ? "Sending..." : `Dispatch (${selectedIds.size})`}
              </Button>
            </div>
          </Card>
          
        </div>
      </div>
    </div>
  )
}
