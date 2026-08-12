"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateEventSettings } from "@/app/actions/event"
import { Loader2, Link as LinkIcon, ExternalLink } from "lucide-react"

export function EventSettingsCard({ event }: { event: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [slug, setSlug] = useState(event.slug || "")
  const [landingTemplate, setLandingTemplate] = useState(event.landingTemplate || "neon")
  const [formSchema, setFormSchema] = useState(event.formSchema ? JSON.stringify(event.formSchema, null, 2) : "")

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      await updateEventSettings(event.id, {
        slug: slug.trim() || undefined,
        landingTemplate,
        formSchema: formSchema.trim() || undefined
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-indigo-100 mt-8">
      <CardHeader>
        <CardTitle className="text-indigo-600">Public Registration Site</CardTitle>
        <CardDescription>Configure your dynamic event landing page and custom registration form.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        {success && <div className="text-green-600 text-sm font-medium">Settings saved successfully!</div>}
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Public URL Slug</Label>
            <div className="flex gap-2">
              <Input 
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                placeholder="e.g. hackathon-2026"
              />
            </div>
            <p className="text-xs text-gray-500">
              Your site will be at: <span className="font-mono text-indigo-500">formtoflow.com/events/{slug || "[slug]"}</span>
            </p>
            {slug && (
              <a href={`/events/${slug}`} target="_blank" className="text-sm text-indigo-600 hover:underline flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" /> Preview Site
              </a>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Landing Template</Label>
            <select 
              className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={landingTemplate}
              onChange={e => setLandingTemplate(e.target.value)}
            >
              <option value="neon">Neon / Dark (Premium)</option>
              <option value="minimal">Minimal / Light</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Custom Form Schema (JSON)</Label>
          <Textarea 
            className="font-mono text-sm h-48"
            placeholder={`[\n  { "id": "name", "label": "Full Name", "type": "text", "required": true }\n]`}
            value={formSchema}
            onChange={e => setFormSchema(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Leave blank for default (Name, Email, Phone, Team Name).
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Public Site Settings
        </Button>
      </CardContent>
    </Card>
  )
}
