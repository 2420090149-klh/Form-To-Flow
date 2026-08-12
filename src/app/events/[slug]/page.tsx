import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PublicRegistrationForm } from "./registration-form"

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  
  const event = await prisma.event.findUnique({
    where: { slug: resolvedParams.slug }
  })

  if (!event) return notFound()

  // Dynamic template selection
  const isDark = event.landingTemplate === "dark" || event.landingTemplate === "neon"

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} flex flex-col items-center justify-center p-4`}>
      {/* Background aesthetics */}
      {isDark && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
        </>
      )}

      <div className={`max-w-2xl w-full p-8 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10 backdrop-blur-xl' : 'bg-white shadow-xl border border-gray-100'}`}>
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            {event.title}
          </h1>
          {event.description && (
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-wrap`}>
              {event.description}
            </p>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm font-medium">
            {event.date && (
              <span className={`px-3 py-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                🗓️ {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {event.location && (
              <span className={`px-3 py-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                📍 {event.location}
              </span>
            )}
          </div>
        </div>

        <PublicRegistrationForm 
          eventId={event.id} 
          schema={event.formSchema ? (event.formSchema as any) : null} 
          isDark={isDark}
        />
      </div>
    </div>
  )
}
