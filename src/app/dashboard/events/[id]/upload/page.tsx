"use client"

import { useState, use } from "react"
import { read, utils } from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, CheckCircle2 } from "lucide-react"

interface ExtractedAttendee {
  name: string
  email: string
  phone: string | null
  teamName: string | null
  isTeamLeader: boolean
  customData: string
}

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [extractedAttendees, setExtractedAttendees] = useState<ExtractedAttendee[]>([])
  const [rawRowCount, setRawRowCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [fileProcessed, setFileProcessed] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileProcessed(false)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = read(bstr, { type: "binary" })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const jsonData = utils.sheet_to_json(ws, { header: 1, defval: "" })
      
      if (jsonData.length > 1) {
        const headers = (jsonData[0] as string[]).map(c => String(c).trim())
        const rows = utils.sheet_to_json(ws, { defval: "" })
        setRawRowCount(rows.length)
        
        // --- 1. Fuzzy Header Matching ---
        let nameCol = ""
        let emailCol = ""
        let phoneCol = ""
        let teamCol = ""
        const memberCols: string[] = []

        headers.forEach(h => {
          const lowerH = h.toLowerCase()
          
          // 1. Leader Name Column: Explicitly ignore college/school
          if (!nameCol && /leader name|team leader|participant name|^name$/i.test(lowerH) && !/college|university|school|institution/i.test(lowerH)) nameCol = h
          
          // 2. Team Name Column: Explicitly ignore leader/member/size
          if (!teamCol && /team name|group name|^team$/i.test(lowerH) && !/leader|member|size|type/i.test(lowerH)) teamCol = h
          
          // 3. Leader Email Column
          if (!emailCol && /leader email|team leader email|^email address$|^email$/i.test(lowerH)) emailCol = h
          
          // 4. Leader Phone Column
          if (!phoneCol && /mobile|phone|contact/i.test(lowerH) && !lowerH.includes("member")) phoneCol = h
          
          // Member Columns
          if (/member|teammate|partner|participant/i.test(lowerH) && h !== nameCol && h !== emailCol && h !== teamCol) {
            memberCols.push(h)
          }
        })

        // --- 2. Extract and Flatten ---
        const allAttendees: ExtractedAttendee[] = []

        rows.forEach((r: any) => {
          const rowData = r as Record<string, any>
          const teamName = teamCol ? String(rowData[teamCol] || "").trim() : null
          
          // Leader
          const leaderName = nameCol ? String(rowData[nameCol] || "").trim() : ""
          const leaderEmail = emailCol ? String(rowData[emailCol] || "").trim() : ""
          const leaderPhone = phoneCol ? String(rowData[phoneCol] || "").trim() : null
          
          if (leaderEmail) { // Minimal requirement to send a pass is an email
            allAttendees.push({
              name: leaderName || "Attendee",
              email: leaderEmail,
              phone: leaderPhone,
              teamName,
              isTeamLeader: true,
              customData: JSON.stringify(rowData)
            })
          }

          // Scan all other cells (or just member cols + unmatched cols) for combined member data
          const colsToScan = memberCols.length > 0 ? memberCols : headers.filter(h => h !== nameCol && h !== emailCol && h !== phoneCol && h !== teamCol)
          
          colsToScan.forEach(col => {
            const cellValue = String(rowData[col] || "").trim()
            if (!cellValue) return

            // Regex extraction
            const emailMatch = cellValue.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
            if (emailMatch) {
              const email = emailMatch[0]
              
              // Phone regex (simple generic)
              const phoneMatch = cellValue.match(/\+?\d[\d\s-]{8,12}\d/)
              const phone = phoneMatch ? phoneMatch[0] : null
              
              // Name is whatever is left over after stripping email and phone
              let name = cellValue.replace(email, "")
              if (phone) name = name.replace(phone, "")
              name = name.replace(/[\(\)\[\]]/g, "").trim()
              // Trim leading and trailing punctuation (commas, newlines, semicolons, extra spaces)
              name = name.replace(/^[,\s\n\-\/;\:]+|[,\s\n\-\/;\:]+$/g, '').trim()
              
              if (!name) name = "Team Member"

              allAttendees.push({
                name,
                email,
                phone,
                teamName,
                isTeamLeader: false,
                customData: JSON.stringify(rowData)
              })
            }
          })
        })

        // Filter valid ones
        const validAttendees = allAttendees.filter(a => a.email && a.email.includes("@"))
        setExtractedAttendees(validAttendees)
        setFileProcessed(true)
      }
    }
    reader.readAsBinaryString(file)
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Universal Auto-Detect Upload</CardTitle>
          <CardDescription>Upload any Excel or CSV file. We will automatically find names, emails, and extract merged team members into individual tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Attendee File</Label>
            <Input id="file" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
          </div>
        </CardContent>
      </Card>

      {fileProcessed && (
        <Card className="border-green-100 shadow-sm">
          <CardHeader className="bg-green-50/50 pb-4 border-b">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600 h-5 w-5" />
              <CardTitle className="text-green-800 text-lg">Extraction Complete</CardTitle>
            </div>
            <CardDescription className="text-green-700/80 mt-1">
              We parsed <strong>{rawRowCount}</strong> rows and automatically extracted <strong>{extractedAttendees.length}</strong> individual attendees.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            <div className="rounded-md border max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
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
