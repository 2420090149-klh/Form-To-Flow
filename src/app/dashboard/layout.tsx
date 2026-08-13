import { auth } from "@/auth"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Global Dashboard Ambient Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none animate-pulse duration-10000 z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none animate-pulse duration-10000 z-0" />

      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <Link href="/dashboard" className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary truncate drop-shadow-sm">
              Form-To-Flow
            </Link>
            <nav className="hidden md:flex gap-4 mt-1">
              <Link href="/dashboard" className="text-lg font-medium hover:text-primary transition-colors">
                Events
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[150px]">{session?.user?.email}</span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        {children}
      </main>
    </div>
  )
}
