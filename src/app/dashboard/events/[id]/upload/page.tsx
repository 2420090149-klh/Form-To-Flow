"use client"

import { useState, use } from "react"
import { read, utils } from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, CheckCircle2, Settings2 } from "lucide-react"

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -z-10 bottom-0 left-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 drop-shadow-sm">Upload Attendees</h1>
      </div>
      
      <Card className="backdrop-blur-xl bg-background/60 border-white/10 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl font-bold text-foreground">Intelligent File Upload</CardTitle>
          <CardDescription className="text-muted-foreground">Upload an Excel or CSV file. Map the required fields, and we will extract the rest of the attendees automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Attendee File</Label>
            <Input id="file" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
          </div>
        </CardContent>
      </Card>

      {showMapping && (
        <Card className="border-blue-500/20 shadow-[0_0_30px_-5px_rgba(59,130,246,0.1)] backdrop-blur-xl bg-background/60 mt-8 animate-in slide-in-from-bottom-4">
          <CardHeader className="bg-blue-500/5 pb-4 border-b border-blue-500/10">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-blue-500 text-lg font-bold">Map Your Columns</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground mt-1">
              Match your file's columns to the required attendee fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Name Column</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={mappings.nameCol}
                  onChange={e => setMappings({...mappings, nameCol: e.target.value})}
                >
                  <option value="">-- Select Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Primary Email Column</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={mappings.emailCol}
                  onChange={e => setMappings({...mappings, emailCol: e.target.value})}
                >
                  <option value="">-- Select Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Primary Phone Column</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={mappings.phoneCol}
                  onChange={e => setMappings({...mappings, phoneCol: e.target.value})}
                >
                  <option value="">-- Select Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Team Name Column</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={mappings.teamCol}
                  onChange={e => setMappings({...mappings, teamCol: e.target.value})}
                >
                  <option value="">-- Select Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            
            <Button onClick={processMapping} className="w-full">
              Extract Attendees
            </Button>
          </CardContent>
        </Card>
      )}

      {fileProcessed && (
        <Card className="border-green-500/20 shadow-[0_0_30px_-5px_rgba(34,197,94,0.1)] backdrop-blur-xl bg-background/60 mt-8 animate-in slide-in-from-bottom-4">
          <CardHeader className="bg-green-500/5 pb-4 border-b border-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <CardTitle className="text-green-500 text-lg font-bold">Extraction Complete</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground mt-1">
              Successfully extracted {extractedAttendees.length} attendees. Review below before uploading.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            <div className="rounded-md border max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white shadow-sm">
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Team</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedAttendees.slice(0, 100).map((att, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {att.isTeamLeader ? (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">Leader</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Member</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{att.name}</TableCell>
                      <TableCell>{att.email}</TableCell>
                      <TableCell>{att.phone || <span className="text-gray-400 text-xs">N/A</span>}</TableCell>
                      <TableCell>{att.teamName || <span className="text-gray-400 text-xs">None</span>}</TableCell>
                    </TableRow>
                  ))}
                  {extractedAttendees.length > 100 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500 bg-gray-50 text-sm">
                        ... and {extractedAttendees.length - 100} more attendees
                      </TableCell>
                    </TableRow>
                  )}
                  {extractedAttendees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No valid attendees with emails could be found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <Button onClick={handleSubmit} disabled={uploading || extractedAttendees.length === 0} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Saving Attendees..." : `Confirm & Save ${extractedAttendees.length} Attendees`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

