"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export type FormFieldSchema = {
  id: string
  label: string
  type: string
  required?: boolean
  options?: string[]
}

const defaultSchema: FormFieldSchema[] = [
  { id: "name", label: "Full Name", type: "text", required: true },
  { id: "email", label: "Email Address", type: "email", required: true },
  { id: "phone", label: "Phone Number", type: "text", required: false },
  { id: "teamName", label: "Team Name (if applicable)", type: "text", required: false },
]

export function PublicRegistrationForm({ eventId, schema, isDark }: { eventId: string, schema: FormFieldSchema[] | null, isDark: boolean }) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeSchema = schema && schema.length > 0 ? schema : defaultSchema

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/events/public-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          formData
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to register")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-green-50 border border-green-100'}`}>
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
        <p className={isDark ? 'text-gray-300' : 'text-green-800'}>
          Thank you for registering. You will receive your pass soon!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {activeSchema.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className={isDark ? "text-gray-200" : ""}>
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={field.id}
            type={field.type}
            required={field.required}
            value={formData[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={isDark ? "bg-white/5 border-white/10 text-white focus:border-indigo-500 placeholder:text-gray-500" : ""}
          />
        </div>
      ))}

      <Button 
        type="submit" 
        className={`w-full py-6 text-lg font-semibold ${isDark ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0' : ''}`}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {loading ? "Registering..." : "Complete Registration"}
      </Button>
    </form>
  )
}
