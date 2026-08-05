"use client"

import { useState, use, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from "qrcode.react"
import { Upload } from "lucide-react"

const TEMPLATES = [
  { id: "vip", name: "VIP Ticket" },
  { id: "minimal", name: "Minimalist Badge" },
  { id: "modern", name: "Modern Conference Pass" },
  { id: "custom", name: "Custom Image (Upload)" }
]

export default function TemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [template, setTemplate] = useState("vip")
  const [color, setColor] = useState("#2563eb")
  const [textColor, setTextColor] = useState("#ffffff")
  
  // Custom Template States
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [qrSize, setQrSize] = useState(150)
  const [qrX, setQrX] = useState(50) // percentage
  const [qrY, setQrY] = useState(50) // percentage

  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Compress image client side
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 800
        let width = img.width
        let height = img.height

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 jpeg
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCustomImage(dataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { 
        template, 
        color, 
        textColor,
        customTemplateImage: template === "custom" ? customImage : null,
        customTemplateLayout: template === "custom" ? JSON.stringify({ size: qrSize, x: qrX, y: qrY }) : null
      }

      const res = await fetch(`/api/events/${unwrappedParams.id}/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
              <Select value={template} onValueChange={(val) => val && setTemplate(val)}>
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
            
            {template !== "custom" && (
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
            )}

            {template === "custom" && (
              <div className="space-y-6 pt-4 border-t border-dashed mt-4">
                <div className="space-y-2">
                  <Label>Upload Custom Design (Image)</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg" 
                      onChange={handleImageUpload} 
                    />
                    {customImage && <span className="text-sm text-green-600 font-medium">Image Loaded!</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">JPEG or PNG. We will compress it automatically.</p>
                </div>

                {customImage && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm">QR Code Positioning</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><Label>Size (px)</Label><span>{qrSize}px</span></div>
                      <Input type="range" min="50" max="300" value={qrSize} onChange={e => setQrSize(parseInt(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><Label>Horizontal Position (X %)</Label><span>{qrX}%</span></div>
                      <Input type="range" min="0" max="100" value={qrX} onChange={e => setQrX(parseInt(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><Label>Vertical Position (Y %)</Label><span>{qrY}%</span></div>
                      <Input type="range" min="0" max="100" value={qrY} onChange={e => setQrY(parseInt(e.target.value))} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving || (template === "custom" && !customImage)} className="w-full mt-4">
              {saving ? "Saving..." : "Save Template"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-xl border-2 border-dashed overflow-hidden relative">
        {/* Pass Preview Wrapper */}
        {template !== "custom" ? (
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
        ) : (
          <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-200 rounded relative">
            {customImage ? (
              <div className="relative inline-block max-w-full shadow-2xl">
                <img src={customImage} alt="Custom Template Preview" className="max-w-full max-h-[500px] object-contain block" />
                <div 
                  className="absolute bg-white p-2 rounded shadow-lg flex items-center justify-center border-2 border-dashed border-blue-500"
                  style={{
                    left: `${qrX}%`,
                    top: `${qrY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${qrSize}px`,
                    height: `${qrSize}px`
                  }}
                >
                  <QRCodeSVG value="SAMPLE-CODE" size={qrSize - 16} />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 font-medium">Upload an image to see preview.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
