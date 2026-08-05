import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-6 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold tracking-tighter text-blue-600">FormToData</h1>
        <nav className="flex gap-4">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Sign In
          </Link>
          <Link href="/register" className={buttonVariants({ variant: "default" })}>
            Get Started
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-8 bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-4 max-w-3xl">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-tight">
            Seamless Event Check-ins <br className="hidden md:block" /> From Spreadsheet to Door.
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Upload your guest lists from Excel or Google Sheets, map your columns instantly, 
            generate custom QR codes, and scan them at the door. Everything you need to manage your event seamlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-lg px-8 h-14 w-full sm:w-auto")}>
            Create an Event
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-lg px-8 h-14 w-full sm:w-auto")}>
            Go to Dashboard
          </Link>
        </div>
      </main>

      <footer className="w-full p-6 text-center text-gray-400 text-sm border-t">
        &copy; {new Date().getFullYear()} FormToData. Built for event organizers.
      </footer>
    </div>
  )
}
