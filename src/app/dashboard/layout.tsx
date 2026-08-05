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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <Link href="/dashboard" className="text-xl md:text-3xl font-bold text-primary truncate">
              Form-To-Flow
            </Link>
            <nav className="hidden md:flex gap-4 mt-1">
              <Link href="/dashboard" className="text-lg font-medium hover:text-primary/80 transition-colors">
                Events
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <span className="hidden sm:inline text-sm text-gray-500 truncate max-w-[150px]">{session?.user?.email}</span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
