import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Premium God-Tier Backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Ambient Orbs */}
      <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse duration-10000 z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none animate-pulse duration-10000 z-0" />

      <header className="w-full p-6 flex justify-between items-center border-b border-border/40 bg-background/60 backdrop-blur-xl z-20 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-sm">FormToFlow</h1>
        </div>
        <nav className="flex gap-3 sm:gap-4">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hover:bg-primary/5 transition-colors font-medium")}>
            Sign In
          </Link>
          <Link href="/register" className={cn(buttonVariants({ variant: "default" }), "shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-300 font-medium bg-gradient-to-r from-primary to-secondary border-0")}>
            Get Started
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 space-y-12 z-10 relative">
        <div className="space-y-6 max-w-5xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-secondary/10 blur-[80px] -z-10 animate-in fade-in zoom-in duration-1000" />
          
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></span>
            The Ultimate Event Management Platform
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 drop-shadow-sm">
            Seamless Check-ins <br className="hidden md:block" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-secondary animate-gradient-x inline-block mt-2">
              From Spreadsheet to Door.
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both leading-relaxed">
            Upload your guest lists from Excel or Google Sheets, map your columns instantly, 
            generate custom QR codes, and scan them at the door. Everything you need to manage your event seamlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0 animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both pt-4">
          <Link href="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-lg px-8 h-14 w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-xl shadow-primary/25 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-0")}>
            <span className="relative z-10 font-semibold">Create an Event — It's Free</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-lg px-8 h-14 w-full sm:w-auto border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-background/50 font-medium")}>
            Go to Dashboard
          </Link>
        </div>
      </main>

      <footer className="w-full p-6 text-center text-muted-foreground text-sm border-t border-border/40 bg-background/60 backdrop-blur-xl z-20 animate-in fade-in duration-1000 delay-500 fill-mode-both">
        &copy; {new Date().getFullYear()} FormToFlow. Built for event organizers.
      </footer>
    </div>
  )
}
