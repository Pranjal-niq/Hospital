import { NextResponse } from "next/server"

const users: Record<string, { password: string; role: string; doctorName?: string }> = {
  reception: {
    password: process.env.RECEPTION_PASSWORD!,
    role: "reception"
  },
  rajesh: {
    password: process.env.RAJESH_PASSWORD!,
    role: "doctor",
    doctorName: "Dr Rajesh Patil"
  },
  sunita: {
    password: process.env.SUNITA_PASSWORD!,
    role: "doctor",
    doctorName: "Dr Sunita Deshmukh"
  },
  mohan: {
    password: process.env.MOHAN_PASSWORD!,
    role: "doctor",
    doctorName: "Dr Mohan Kulkarni"
  }
}

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const user = users[username]

  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  }

  const response = NextResponse.json({
    success: true,
    role: user.role,
    doctor: user.doctorName || null
  })

  response.cookies.set("auth", "true", { httpOnly: true, path: "/" })
  response.cookies.set("role", user.role, { httpOnly: true, path: "/" })
  response.cookies.set("username", username, { httpOnly: true, path: "/" })

  if (user.role === "doctor" && user.doctorName) {
    response.cookies.set("doctor", user.doctorName, { httpOnly: true, path: "/" })
  }

  return response
}
