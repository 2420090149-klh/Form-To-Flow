"use client"

import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateEventSettings } from "@/app/actions/event"
import { Loader2, ExternalLink, Plus, Trash2, GripVertical } from "lucide-react"

type FormField = { id: string; label: string; type: string; required: boolean }

const DEFAULT_FIELDS: FormField[] = [
  { id: "name", label: "Full Name", type: "text", required: true },
  { id: "email", label: "Email Address", type: "email", required: true },
  { id: "phone", label: "Phone Number", type: "tel", required: false },
  { id: "team", label: "Team Name", type: "text", required: false },
]

const QUICK_ADD_TEMPLATES = [
  { label: "T-Shirt Size", type: "text" },
  { label: "GitHub Link", type: "url" },
  { label: "LinkedIn", type: "url" },
  { label: "Dietary Restrictions", type: "text" },
]

export function EventSettingsCard({ event }: { event: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [slug, setSlug] = useState(event.slug || "")
  const [landingTemplate, setLandingTemplate] = useState(event.landingTemplate || "neon")
  
  const [fields, setFields] = useState<FormField[]>(() => {
    if (event.formSchema && Array.isArray(event.formSchema) && event.formSchema.length > 0) {
      return event.formSchema
    }
    return DEFAULT_FIELDS
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlug(event.slug || "")
    setLandingTemplate(event.landingTemplate || "neon")
    if (event.formSchema && Array.isArray(event.formSchema) && event.formSchema.length > 0) {
      setFields(event.formSchema)
    }
  }, [event])

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      await updateEventSettings(event.id, {
        slug: slug.trim() || undefined,
        landingTemplate,
        formSchema: JSON.stringify(fields)
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addField = (template?: {label: string, type: string}) => {
    if (template) {
      setFields([...fields, { 
        id: template.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label: template.label,
        type: template.type,
        required: false
      }])
    } else {
      setFields([...fields, { id: `field_${Date.now()}`, label: "New Field", type: "text", required: false }])
    }
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, key: keyof FormField, value: any) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], [key]: value }
    // Auto-update ID when label changes if it's a new field
    if (key === 'label' && newFields[index].id.startsWith('field_')) {
      newFields[index].id = value.toLowerCase().replace(/[^a-z0-9]/g, '_') || newFields[index].id
    }
    setFields(newFields)
  }

  return (
    <Card className="mt-8 backdrop-blur-xl bg-background/60 border-white/10 shadow-xl shadow-indigo-500/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Public Registration Site</CardTitle>
        <CardDescription className="text-muted-foreground/80">Configure your dynamic event landing page and custom registration form.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        {success && <div className="text-green-600 text-sm font-medium">Settings saved successfully!</div>}
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Public URL Slug</Label>
            <div className="flex gap-2">
              <Input 
                value={slug} 
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-'))} 
                placeholder="e.g. hackathon-2026"
              />
            </div>
            <p className="text-xs text-gray-500">
              Your public registration site URL:
            </p>
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-md p-3">
              <span className="font-mono text-sm flex-1 text-muted-foreground truncate">
                {typeof window !== 'undefined' ? window.location.origin : 'https://formtoflow.com'}/events/{slug || "[slug]"}
              </span>
              {slug && (
                <a 
                  href={`/events/${slug}`} 
                  target="_blank" 
                  className="bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center whitespace-nowrap shadow-sm"
                >
                  <ExternalLink className="w-3 h-3 mr-1" /> Open Site
                </a>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Landing Template</Label>
            <select 
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={landingTemplate}
              onChange={e => setLandingTemplate(e.target.value)}
            >
              <option value="neon">Neon / Dark (Premium)</option>
              <option value="minimal">Minimal / Light</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/10">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Registration Form Builder</h3>
            <p className="text-sm text-muted-foreground mb-4">Design the exact questions you want to ask your attendees.</p>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-primary/5 hover:bg-primary/10 transition-colors p-4 rounded-xl border border-primary/10 group">
                <GripVertical className="text-gray-400 w-5 h-5 cursor-move hidden sm:block" />
                
                <div className="flex-1 min-w-[150px]">
                  <Label className="text-xs text-muted-foreground mb-1 block font-medium">Question Label</Label>
                  <Input 
                    value={field.label} 
                    onChange={e => updateField(index, 'label', e.target.value)}
                    className="h-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500"
                  />
                </div>
                
                <div className="w-full sm:w-40">
                  <Label className="text-xs text-muted-foreground mb-1 block font-medium">Input Type</Label>
                  <select 
                    className="w-full h-9 rounded-md border border-white/10 bg-background/50 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    value={field.type}
                    onChange={e => updateField(index, 'type', e.target.value)}
                  >
                    <option value="text">Short Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="url">Website / URL</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3 mt-5">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={field.required}
                      onChange={e => updateField(index, 'required', e.target.checked)}
                      className="rounded border-white/20 bg-background/50 text-indigo-500 focus:ring-indigo-500 w-4 h-4"
                    />
                    Required
                  </label>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-9 px-3 ml-2"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button variant="outline" size="sm" onClick={() => addField()} className="border-dashed border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
              <Plus className="w-4 h-4 mr-1" /> Add Custom Field
            </Button>
            <div className="h-9 w-px bg-white/10 mx-2 hidden sm:block"></div>
            {QUICK_ADD_TEMPLATES.map(template => (
              <Button 
                key={template.label} 
                variant="secondary" 
                size="sm" 
                onClick={() => addField(template)}
                className="text-xs bg-primary/10 hover:bg-primary/20 text-primary"
              >
                + {template.label}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Public Site Settings
        </Button>
      </CardContent>
    </Card>
  )
}
