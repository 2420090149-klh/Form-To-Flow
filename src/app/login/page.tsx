import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { Mail, Shield, User, Lock, Calendar } from "lucide-react"

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background p-4 relative overflow-hidden">
      {/* Decorative Floating Icons */}
      <Mail className="absolute top-[15%] left-[20%] w-12 h-12 text-primary/30 animate-[bounce_4s_ease-in-out_infinite]" />
      <Shield className="absolute top-[20%] right-[25%] w-16 h-16 text-secondary/30 animate-[pulse_5s_ease-in-out_infinite]" />
      <User className="absolute bottom-[25%] left-[15%] w-20 h-20 text-blue-500/20 animate-[bounce_6s_ease-in-out_infinite_1s]" />
      <Lock className="absolute bottom-[20%] right-[20%] w-14 h-14 text-purple-500/20 animate-[pulse_7s_ease-in-out_infinite]" />
      <Calendar className="absolute top-[40%] left-[5%] w-24 h-24 text-primary/10 animate-[spin_15s_linear_infinite]" />
      
      <Card className="w-full max-w-md relative z-10 border-primary/20 dark:shadow-[0_0_30px_-5px_rgba(96,165,250,0.3)]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account
          </CardDescription>
          {searchParams?.error === "CredentialsSignin" && (
            <div className="text-sm font-medium text-destructive mt-2">
              Invalid email or password.
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
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
          <div className="text-sm text-gray-500 mt-2">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
