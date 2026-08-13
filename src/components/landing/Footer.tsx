import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50 py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center opacity-90">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              FormToFlow
            </span>
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
            The smarter way to manage event entry. From spreadsheet to door in minutes.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-8 md:gap-16 text-sm">
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">Product</h4>
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">Company</h4>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>

      </div>
      
      <div className="container mx-auto max-w-6xl mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FormToFlow. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  )
}
