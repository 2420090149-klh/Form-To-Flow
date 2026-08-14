"use client"

import { useState, use, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from "qrcode.react"
import { Upload, FileImage, Save, ArrowLeft, Image as ImageIcon, QrCode, Loader2 } from "lucide-react"
import Link from "next/link"

const TEMPLATES = [
  { id: "vip", name: "VIP Ticket" },
  { id: "minimal", name: "Minimalist Badge" },
  { id: "modern", name: "Modern Conference Pass" },
  { id: "custom", name: "Custom Image (Upload)" }
]

export default function TemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [template, setTemplate] = useState("vip")
  const [color, setColor] = useState("#4f46e5")
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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FileImage className="w-8 h-8 text-indigo-500" />
            Pass Templates
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Design and customize the QR passes for your event guests.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Settings Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>Configure the appearance of your generated passes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Template Style</Label>
                <Select value={template} onValueChange={(val) => val && setTemplate(val)}>
                  <SelectTrigger className="bg-background border-border/60">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Primary Color</Label>
                    <div className="flex gap-3">
                      <div className="relative rounded-md overflow-hidden w-12 h-10 border border-border/60 shadow-sm">
                        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                      </div>
                      <Input type="text" value={color} onChange={e => setColor(e.target.value)} className="font-mono text-sm uppercase bg-background border-border/60" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Text Color</Label>
                    <div className="flex gap-3">
                      <div className="relative rounded-md overflow-hidden w-12 h-10 border border-border/60 shadow-sm">
                        <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                      </div>
                      <Input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className="font-mono text-sm uppercase bg-background border-border/60" />
                    </div>
                  </div>
                </div>
              )}

              {template === "custom" && (
                <div className="space-y-6 pt-4 border-t border-border/40">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Custom Background Image</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <Button variant="outline" className="border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          {customImage ? "Change Image" : "Choose Image"}
                        </Button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/png, image/jpeg" 
                          onChange={handleImageUpload} 
                        />
                        {customImage && <span className="text-sm text-emerald-500 font-medium">Image Loaded</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">Optimal dimensions: 1080x1920 (9:16 portrait)</p>
                    </div>
                  </div>

                  {customImage && (
                    <div className="space-y-5 bg-primary/5 p-5 rounded-xl border border-primary/10">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                        <QrCode className="w-4 h-4" /> QR Code Placement
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium"><Label>QR Size</Label><span>{qrSize}px</span></div>
                        <Input type="range" min="50" max="400" value={qrSize} onChange={e => setQrSize(parseInt(e.target.value))} className="accent-primary" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium"><Label>Horizontal (X)</Label><span>{qrX}%</span></div>
                        <Input type="range" min="0" max="100" value={qrX} onChange={e => setQrX(parseInt(e.target.value))} className="accent-primary" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium"><Label>Vertical (Y)</Label><span>{qrY}%</span></div>
                        <Input type="range" min="0" max="100" value={qrY} onChange={e => setQrY(parseInt(e.target.value))} className="accent-primary" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleSave} disabled={saving || (template === "custom" && !customImage)} className="w-full bg-gradient-to-r from-primary to-indigo-500 hover:opacity-90 shadow-md">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Save Template Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-7">
          <Card className="bg-background/60 backdrop-blur-md border-border/40 shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 md:p-12 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 relative overflow-hidden min-h-[500px]">
              
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Preview Rendering */}
              {template !== "custom" ? (
                <div 
                  className={`relative z-10 overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ring-1 ring-black/5 ${
                    template === 'minimal' ? 'rounded-xl w-[300px] h-[450px] bg-white border' 
                    : template === 'modern' ? 'rounded-2xl w-[320px] h-[500px] bg-white' 
                    : 'rounded-2xl w-[340px] h-[540px]'
                  }`}
                  style={{
                    backgroundColor: template === 'vip' ? color : 'white',
                    color: template === 'vip' ? textColor : 'black'
                  }}
                >
                  {/* Header */}
                  <div 
                    className="w-full text-center p-6 shrink-0"
                    style={{
                      backgroundColor: template !== 'vip' ? color : undefined,
                      color: template !== 'vip' ? textColor : undefined
                    }}
                  >
                    <h2 className="text-2xl font-black tracking-tight">EVENT NAME</h2>
                    <p className="text-xs font-semibold opacity-80 uppercase tracking-[0.2em] mt-1">{template} PASS</p>
                  </div>
                  
                  {/* Body */}
                  <div className={`p-8 flex flex-col items-center gap-6 ${template === 'vip' ? 'bg-black/10' : ''} w-full flex-1 justify-center`}>
                    <div className="text-center space-y-1">
                      <h3 className="text-2xl font-bold">John Doe</h3>
                      <p className="text-sm opacity-70">john.doe@example.com</p>
                    </div>
                    
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-black/5">
                      <QRCodeSVG value="SAMPLE-TICKET-CODE-123" size={160} />
                    </div>
                    
                    <p className="text-xs opacity-60 font-mono tracking-widest mt-2">TICKET-123</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                  {customImage ? (
                    <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10">
                      <img src={customImage} alt="Custom Template Preview" className="max-w-[340px] max-h-[600px] w-auto h-auto object-contain block" />
                      <div 
                        className="absolute bg-white p-3 rounded-xl shadow-xl flex items-center justify-center border-2 border-dashed border-indigo-500/50"
                        style={{
                          left: `${qrX}%`,
                          top: `${qrY}%`,
                          transform: 'translate(-50%, -50%)',
                          width: `${qrSize}px`,
                          height: `${qrSize}px`
                        }}
                      >
                        <QRCodeSVG value="SAMPLE-CODE" size={qrSize - 24} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 opacity-50">
                      <ImageIcon className="w-12 h-12 mx-auto" />
                      <p className="font-medium text-sm">Upload a background image to see the preview.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
