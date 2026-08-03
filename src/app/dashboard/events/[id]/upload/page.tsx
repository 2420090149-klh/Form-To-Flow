"use client"

import { useState, use } from "react"
import { read, utils } from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<{name: string, email: string, phone: string}>({
    name: "", email: "", phone: ""
  })
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = read(bstr, { type: "binary" })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const jsonData = utils.sheet_to_json(ws, { header: 1, defval: "" })
      
      if (jsonData.length > 0) {
        setColumns((jsonData[0] as string[]).map(c => String(c).trim()).filter(Boolean))
        const rows = utils.sheet_to_json(ws, { defval: "" })
        
        // Normalize row keys by trimming them
        const normalizedRows = rows.map((r: any) => {
          const newRow: any = {}
          for (const key in r) {
            newRow[key.trim()] = r[key]
          }
          return newRow
        })
        setData(normalizedRows)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleSubmit = async () => {
    if (!mapping.name || !mapping.email) {
      alert("Name and Email are required mappings")
      return
    }

    setUploading(true)
    try {
      const mappedData = data.map(row => ({
        name: String(row[mapping.name] || "").trim(),
        email: String(row[mapping.email] || "").trim(),
        phone: mapping.phone ? String(row[mapping.phone] || "").trim() : null,
        customData: JSON.stringify(row)
      })).filter(row => row.name && row.email) // filter empty rows

      if (mappedData.length === 0) {
        alert("No valid rows found after mapping. Make sure rows have both name and email.")
        setUploading(false)
        return
      }

      const res = await fetch(`/api/events/${unwrappedParams.id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees: mappedData })
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
          <CardTitle>Upload Attendees</CardTitle>
          <CardDescription>Upload an Excel or CSV file to add attendees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Attendee File</Label>
            <Input id="file" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Map Columns</CardTitle>
            <CardDescription>Map your file columns to the standard fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name Column *</Label>
                <Select onValueChange={(val) => setMapping(prev => ({...prev, name: val}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email Column *</Label>
                <Select onValueChange={(val) => setMapping(prev => ({...prev, email: val}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone Column (Optional)</Label>
                <Select onValueChange={(val) => setMapping(prev => ({...prev, phone: val}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col, i) => (
                      <TableHead key={i}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((col, j) => (
                        <TableCell key={j}>{row[col]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Button onClick={handleSubmit} disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Save Attendees"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
