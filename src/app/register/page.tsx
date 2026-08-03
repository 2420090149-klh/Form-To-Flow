import { registerUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Mail, Shield, User, Lock, Calendar } from "lucide-react"

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background p-4 relative overflow-hidden">
      {/* Decorative Floating Icons */}
      <Mail className="absolute top-[15%] right-[20%] w-12 h-12 text-primary/30 animate-[bounce_4s_ease-in-out_infinite]" />
      <Shield className="absolute top-[20%] left-[25%] w-16 h-16 text-secondary/30 animate-[pulse_5s_ease-in-out_infinite]" />
      <User className="absolute bottom-[25%] right-[15%] w-20 h-20 text-blue-500/20 animate-[bounce_6s_ease-in-out_infinite_1s]" />
      <Lock className="absolute bottom-[20%] left-[20%] w-14 h-14 text-purple-500/20 animate-[pulse_7s_ease-in-out_infinite]" />
      <Calendar className="absolute top-[40%] right-[5%] w-24 h-24 text-primary/10 animate-[spin_15s_linear_infinite]" />
      
      <Card className="w-full max-w-md relative z-10 border-primary/20 dark:shadow-[0_0_30px_-5px_rgba(96,165,250,0.3)]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
          {searchParams?.error && (
            <div className="text-sm font-medium text-destructive mt-2">
              {searchParams.error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button className="w-full" type="submit">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center">
          <div className="text-sm text-gray-500 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
