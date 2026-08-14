import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"


export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const loginAction = async (formData: FormData) => {
    "use server"
    try {
      await signIn("credentials", Object.fromEntries(formData))
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/login?error=CredentialsSignin")
      }
      throw error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden animate-in fade-in duration-700">
      {/* Ambient Grid and Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      
      <Card className="w-full max-w-md relative z-10 border-border/40 backdrop-blur-xl bg-background/80 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-700">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter your email to sign in to your account
          </CardDescription>
          {searchParams?.error === "CredentialsSignin" && (
            <div className="text-sm font-medium text-destructive mt-2 animate-in slide-in-from-top-2">
              Invalid email or password.
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-muted-foreground group-focus-within:text-primary transition-colors">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 border-white/10 focus-visible:ring-primary transition-all" />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-background/50 border-white/10 focus-visible:ring-primary transition-all" />
            </div>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          
          <form action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}>
            <Button variant="outline" className="w-full" type="submit">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
