import { NextResponse } from "next/server"

export function middleware(request) {

  const auth = request.cookies.get("auth")

  // If user tries to access admin pages
  if (request.nextUrl.pathname.startsWith("/admin")) {

    if (!auth) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      )
    }

  }

  return NextResponse.next()

}

export const config = {
  matcher: ["/admin/:path*"]
}