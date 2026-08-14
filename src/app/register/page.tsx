import { registerUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"


export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const registerAction = async (formData: FormData) => {
    "use server"
    const res = await registerUser(formData)
    if (res?.error) {
      redirect("/register?error=" + encodeURIComponent(res.error))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden animate-in fade-in duration-700">
      {/* Ambient Grid and Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      
      <Card className="w-full max-w-md relative z-10 border-border/40 backdrop-blur-xl bg-background/80 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-700">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter your details below to create your account
          </CardDescription>
          {searchParams?.error && (
            <div className="text-sm font-medium text-destructive mt-2 animate-in slide-in-from-top-2">
              {searchParams.error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-muted-foreground group-focus-within:text-primary transition-colors">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required className="bg-background/50 border-white/10 focus-visible:ring-primary transition-all" />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-muted-foreground group-focus-within:text-primary transition-colors">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 border-white/10 focus-visible:ring-primary transition-all" />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-background/50 border-white/10 focus-visible:ring-primary transition-all" />
            </div>
            <Button className="w-full" type="submit">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center">
          <div className="text-sm text-gray-500 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
