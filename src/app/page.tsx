import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none animate-pulse duration-10000" />

      <header className="w-full p-6 flex justify-between items-center border-b border-border/50 backdrop-blur-md z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-sm">FormToFlow</h1>
        <nav className="flex gap-4">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hover:bg-primary/10 transition-colors")}>
            Sign In
          </Link>
          <Link href="/register" className={cn(buttonVariants({ variant: "default" }), "shadow-lg shadow-primary/25 hover:scale-105 transition-transform duration-300")}>
            Get Started
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-12 z-10 relative">
        <div className="space-y-6 max-w-4xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-[60px] -z-10 animate-in fade-in zoom-in duration-1000" />
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Seamless Event Check-ins <br className="hidden md:block" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-secondary animate-gradient-x">
              From Spreadsheet to Door.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
            Upload your guest lists from Excel or Google Sheets, map your columns instantly, 
            generate custom QR codes, and scan them at the door. Everything you need to manage your event seamlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-4 sm:px-0 animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
          <Link href="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-lg px-8 h-14 w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300 relative overflow-hidden group")}>
            <span className="relative z-10">Create an Event</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-lg px-8 h-14 w-full sm:w-auto border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 backdrop-blur-sm")}>
            Go to Dashboard
          </Link>
        </div>
      </main>

      <footer className="w-full p-6 text-center text-muted-foreground text-sm border-t border-border/50 backdrop-blur-md z-10 animate-in fade-in duration-1000 delay-500 fill-mode-both">
        &copy; {new Date().getFullYear()} FormToFlow. Built for event organizers.
      </footer>
    </div>
  )
}
