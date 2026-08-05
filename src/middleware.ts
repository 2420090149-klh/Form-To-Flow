import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnLogin = req.nextUrl.pathname.startsWith("/login")
  const isOnRegister = req.nextUrl.pathname.startsWith("/register")

  if (isOnDashboard) {
    if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl))
    return
  }

  if (isLoggedIn && (isOnLogin || isOnRegister)) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*", "/login", "/register"],
}
