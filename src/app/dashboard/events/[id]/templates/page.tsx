"use client"

import { useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from "qrcode.react"

const TEMPLATES = [
  { id: "vip", name: "VIP Ticket" },
  { id: "minimal", name: "Minimalist Badge" },
  { id: "modern", name: "Modern Conference Pass" }
]

export default function TemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [template, setTemplate] = useState("vip")
  const [color, setColor] = useState("#2563eb")
  const [textColor, setTextColor] = useState("#ffffff")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${unwrappedParams.id}/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, color, textColor })
      })
      if (res.ok) alert("Template saved successfully!")
      else alert("Failed to save template")
    } catch (err) {
      console.error(err)
      alert("Error saving template")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>Customize the appearance of the event passes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template Style</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-10 p-1" />
                  <Input type="text" value={color} onChange={e => setColor(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-10 p-1" />
                  <Input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
              {saving ? "Saving..." : "Save Template"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-xl border-2 border-dashed">
        {/* Pass Preview Wrapper */}
        <div 
          className={`relative overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all ${
            template === 'minimal' ? 'rounded-md w-64 h-96 bg-white border' 
            : template === 'modern' ? 'rounded-2xl w-72 h-auto bg-white' 
            : 'rounded-xl w-80 h-auto'
          }`}
          style={{
            backgroundColor: template === 'vip' ? color : 'white',
            color: template === 'vip' ? textColor : 'black'
          }}
        >
          {/* Header */}
          <div 
            className="w-full text-center p-4"
            style={{
              backgroundColor: template !== 'vip' ? color : undefined,
              color: template !== 'vip' ? textColor : undefined
            }}
          >
            <h2 className="text-xl font-bold tracking-wider">EVENT NAME</h2>
            <p className="text-sm opacity-80 uppercase tracking-widest">{template} PASS</p>
          </div>
          
          {/* Body */}
          <div className={`p-6 flex flex-col items-center gap-4 ${template === 'vip' ? 'bg-black/10' : ''} w-full flex-1`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold">John Doe</h3>
              <p className="text-sm opacity-70">john.doe@example.com</p>
            </div>
            
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <QRCodeSVG value="SAMPLE-TICKET-CODE-123" size={120} />
            </div>
            
            <p className="text-xs opacity-60 mt-2 font-mono">TICKET-CODE-123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
