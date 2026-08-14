"use client"

import { useState, use } from "react"
import { read, utils } from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, CheckCircle2, Settings2, FileSpreadsheet, DownloadCloud, Loader2, ArrowRight } from "lucide-react"

interface ExtractedAttendee {
  name: string
  email: string
  phone: string | null
  teamName: string | null
  isTeamLeader: boolean
  customData: any
}

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [extractedAttendees, setExtractedAttendees] = useState<ExtractedAttendee[]>([])
  
  // Field Mapping State
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<any[]>([])
  const [showMapping, setShowMapping] = useState(false)
  const [mappings, setMappings] = useState({
    nameCol: "",
    emailCol: "",
    phoneCol: "",
    teamCol: ""
  })
  
  const [uploading, setUploading] = useState(false)
  const [fileProcessed, setFileProcessed] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileProcessed(false)
    setShowMapping(false)
    
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = read(bstr, { type: "binary" })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const jsonData = utils.sheet_to_json(ws, { header: 1, defval: "" })
      
      if (jsonData.length > 1) {
        const fileHeaders = (jsonData[0] as string[]).map(c => String(c).trim())
        const fileRows = utils.sheet_to_json(ws, { defval: "" })
        
        setHeaders(fileHeaders)
        setRawRows(fileRows)
        
        // --- Fuzzy Header Guessing ---
        let guessNameCol = ""
        let guessEmailCol = ""
        let guessPhoneCol = ""
        let guessTeamCol = ""

        fileHeaders.forEach(h => {
          const lowerH = h.toLowerCase()
          if (!guessNameCol && /leader name|team leader|participant name|^name$/i.test(lowerH) && !/college|university|school|institution/i.test(lowerH)) guessNameCol = h
          if (!guessTeamCol && /team name|group name|^team$/i.test(lowerH) && !/leader|member|size|type/i.test(lowerH)) guessTeamCol = h
          if (!guessEmailCol && /leader email|team leader email|^email address$|^email$/i.test(lowerH)) guessEmailCol = h
          if (!guessPhoneCol && /mobile|phone|contact/i.test(lowerH) && !lowerH.includes("member")) guessPhoneCol = h
        })

        setMappings({
          nameCol: guessNameCol,
          emailCol: guessEmailCol,
          phoneCol: guessPhoneCol,
          teamCol: guessTeamCol
        })
        
        setShowMapping(true)
      }
    }
    reader.readAsBinaryString(file)
  }
  
  const processMapping = () => {
    const { nameCol, emailCol, phoneCol, teamCol } = mappings
    const memberCols: string[] = []

    headers.forEach(h => {
      const lowerH = h.toLowerCase()
      if (/member|teammate|partner|participant/i.test(lowerH) && h !== nameCol && h !== emailCol && h !== teamCol && h !== phoneCol) {
        memberCols.push(h)
      }
    })

    const allAttendees: ExtractedAttendee[] = []

    rawRows.forEach((r: any) => {
      const rowData = r as Record<string, any>
      const teamName = teamCol ? String(rowData[teamCol] || "").trim() : null
      
      // Leader
      const leaderName = nameCol ? String(rowData[nameCol] || "").trim() : ""
      const leaderEmail = emailCol ? String(rowData[emailCol] || "").trim() : ""
      const leaderPhone = phoneCol ? String(rowData[phoneCol] || "").trim() : null
      
      if (leaderEmail) {
        allAttendees.push({
          name: leaderName || "Attendee",
          email: leaderEmail,
          phone: leaderPhone,
          teamName,
          isTeamLeader: true,
          customData: rowData
        })
      }

      const colsToScan = memberCols.length > 0 ? memberCols : headers.filter(h => h !== nameCol && h !== emailCol && h !== phoneCol && h !== teamCol)
      
      colsToScan.forEach(col => {
        const cellValue = String(rowData[col] || "").trim()
        if (!cellValue) return

        const emailMatch = cellValue.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
        if (emailMatch) {
          const email = emailMatch[0]
          const phoneMatch = cellValue.match(/\+?\d[\d\s-]{8,12}\d/)
          const phone = phoneMatch ? phoneMatch[0] : null
          
          let name = cellValue.replace(email, "")
          if (phone) name = name.replace(phone, "")
          name = name.replace(/[\(\)\[\]]/g, "").trim()
          name = name.replace(/^[,\s\n\-\/;\:]+|[,\s\n\-\/;\:]+$/g, '').trim()
          if (!name) name = "Team Member"

          allAttendees.push({
            name,
            email,
            phone,
            teamName,
            isTeamLeader: false,
            customData: rowData
          })
        }
      })
    })

    const validAttendees = allAttendees.filter(a => a.email && a.email.includes("@"))
    setExtractedAttendees(validAttendees)
    setShowMapping(false)
    setFileProcessed(true)
  }

  const handleSubmit = async () => {
    if (extractedAttendees.length === 0) return

    setUploading(true)
    try {
      const res = await fetch(`/api/events/${unwrappedParams.id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees: extractedAttendees })
      })

      if (res.ok) {
        alert("Upload successful!")
        window.location.href = `/dashboard/events/${unwrappedParams.id}`
      } else {
        alert("Upload failed")
      }
    } catch (err) {
      console.error(err)
      alert("Error uploading")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            Import Guests
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Upload your registration spreadsheet and automatically extract guest details.</p>
        </div>
      </div>
      
      {!showMapping && !fileProcessed && (
        <Card className="backdrop-blur-xl bg-background/60 border-border/40 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500" />
          <CardHeader className="text-center pt-12 pb-6 relative z-10">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <DownloadCloud className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Upload Spreadsheet</CardTitle>
            <CardDescription className="text-muted-foreground max-w-md mx-auto mt-2">
              Supports .csv, .xlsx, and .xls formats. We'll automatically identify columns and teams.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-12">
            <div className="max-w-md mx-auto">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-background border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors rounded-lg p-8 text-center cursor-pointer">
                  <Input 
                    id="file" 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="font-medium text-foreground">Click to upload or drag and drop</span>
                    <span className="text-xs">Excel or CSV file up to 10MB</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showMapping && (
        <Card className="backdrop-blur-xl bg-background/60 border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Map Data Columns</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  We've guessed the column mappings. Please verify them before proceeding.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Primary Name</Label>
                <select 
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  value={mappings.nameCol}
                  onChange={e => setMappings({...mappings, nameCol: e.target.value})}
                >
                  <option value="">-- Ignore --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Primary Email</Label>
                <select 
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  value={mappings.emailCol}
                  onChange={e => setMappings({...mappings, emailCol: e.target.value})}
                >
                  <option value="">-- Ignore --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Primary Phone (Optional)</Label>
                <select 
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  value={mappings.phoneCol}
                  onChange={e => setMappings({...mappings, phoneCol: e.target.value})}
                >
                  <option value="">-- Ignore --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Team Name (Optional)</Label>
                <select 
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  value={mappings.teamCol}
                  onChange={e => setMappings({...mappings, teamCol: e.target.value})}
                >
                  <option value="">-- Ignore --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border/40">
              <Button onClick={processMapping} className="w-full md:w-auto px-8 h-11 bg-primary hover:opacity-90">
                Extract Attendees <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {fileProcessed && (
        <Card className="backdrop-blur-xl bg-background/60 border-emerald-500/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-6 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-md">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Extraction Complete</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Found <strong className="text-foreground">{extractedAttendees.length}</strong> valid attendees. Review before finalizing.
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={uploading || extractedAttendees.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Saving Data..." : "Confirm & Import"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            
            <div className="rounded-md border max-h-[500px] overflow-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm border-b border-border/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground/80 pl-4">Role</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Name</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Email</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Phone</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Team</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedAttendees.slice(0, 50).map((att, i) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell className="pl-4">
                        {att.isTeamLeader ? (
                          <span className="bg-indigo-500/10 text-indigo-600 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm">Leader</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm">Member</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{att.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{att.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{att.phone || <span className="italic opacity-50">N/A</span>}</TableCell>
                      <TableCell>
                        {att.teamName ? (
                          <span className="inline-block truncate max-w-[150px] text-sm">{att.teamName}</span>
                        ) : (
                          <span className="italic opacity-50 text-sm">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {extractedAttendees.length > 50 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground font-medium bg-slate-50/50 dark:bg-slate-900/50">
                        ... and {extractedAttendees.length - 50} more attendees
                      </TableCell>
                    </TableRow>
                  )}
                  {extractedAttendees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No valid attendees with emails could be found. Check your mapping.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
          </CardContent>
        </Card>
      )}
    </div>
  )
}

