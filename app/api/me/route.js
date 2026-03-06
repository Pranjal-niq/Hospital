import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {

  const cookieStore = await cookies()

  const username = cookieStore.get("username")?.value
  const role = cookieStore.get("role")?.value

  if (!username) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return NextResponse.json({
    username,
    role
  })

}