import { auth } from "@/auth"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/components/sign-out-button"
import { LayoutDashboard, CalendarDays, Users, QrCode, BarChart3, Settings } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans selection:bg-primary/20">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-background/50 backdrop-blur-xl sticky top-0 h-screen z-20">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/dashboard" className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            FormToFlow
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Overview
          </div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors text-foreground">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/events" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Events
          </Link>
          <Link href="/dashboard/guests" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <Users className="h-4 w-4" />
            Guests
          </Link>
          <Link href="/dashboard/passes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <QrCode className="h-4 w-4" />
            Passes
          </Link>
          
          <div className="mt-8 mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Insights & Config
          </div>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>

        <div className="p-4 border-t border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {session?.user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="text-xs truncate text-muted-foreground">
                {session?.user?.email}
              </div>
            </div>
            <ThemeToggle />
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full lg:max-w-[calc(100vw-16rem)]">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
          <Link href="/dashboard" className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            FormToFlow
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* We'd ideally add a mobile sheet navigation here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
          
          <div className="relative z-10 p-6 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
